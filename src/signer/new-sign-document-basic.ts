import { PdfByteRanges, Size } from '../models';
import { InvalidImageError, NoPlaceholderError, SignatureNotFoundError } from '../errors';
import { getPdfRangesFromSignature, toUint8Array } from '../helpers';

import { DocumentSnapshot, mergeUint8Arrays, PDFArray, PDFDict, PDFDocument, PDFImage, PDFName, PDFNumber, PDFObject, PDFPage, PDFRef, PDFString } from 'pdf-lib';
import * as _ from 'lodash';
import { getSignBuffer, loadPdfDocumentAsync, updateByteRange } from './tmp';

class PDFNameEx {
    static Annot = PDFName.of('Annot');
    static Fields = PDFName.of('Fields');
    static FT = PDFName.of('FT');
    static Sig = PDFName.of('Sig');
    static SigFlags = PDFName.of('SigFlags');
    static Subtype = PDFName.of('Subtype');
    static T = PDFName.of('T');
    static V = PDFName.of('V');
    static Widget = PDFName.of('Widget');

    static Helvetica = PDFName.of('Helvetica');
}


export class SignDocumentBasic {

    #pdfDoc: PDFDocument;
    #pdf: Uint8Array;
    #docSnapshot: DocumentSnapshot;

    static async fromPdfAsync(pdf: ArrayBuffer | Buffer | Uint8Array): Promise<SignDocumentBasic> {
        const pdfDoc = await loadPdfDocumentAsync(pdf);

        return new SignDocumentBasic(pdfDoc, pdf);
    }

    private constructor(pdfDoc: PDFDocument, pdf: ArrayBuffer | Buffer | Uint8Array) {
        this.#pdfDoc = pdfDoc;
        this.#pdf = toUint8Array(pdf);

        if(pdfDoc.context.pdfFileDetails.useObjectStreams) { 
            pdfDoc.context.largestObjectNumber += 1; 
        };
        this.#docSnapshot = pdfDoc.takeSnapshot();
    }

    registerDict(dict: any): PDFRef {
        const pdfDict = this.addDict(dict);
        return this.#pdfDoc.context.register(pdfDict);
    }

    addDict(dict: any): PDFDict {
        return this.#pdfDoc.context.obj(dict) as any as PDFDict;
    }

    addPageAnnot(pageIndex: number, annotRef: PDFRef): void {
        this.ensurePageAnnots(pageIndex);
        
        const page = this.#pdfDoc.getPage(pageIndex);
        const pageAnnots = page.node.lookup(PDFName.Annots, PDFArray);
        pageAnnots.push(annotRef);
    }

    addFormField(fieldRef: PDFRef): void {
        const formDict = this.#pdfDoc.getForm().acroForm.dict;
        const formFields = formDict.lookup(PDFNameEx.Fields, PDFArray);
        formFields.push(fieldRef);
        this.#docSnapshot.markObjForSave(formDict)
    }

    addPageContent(pageIndex: number, visualRef: PDFRef): void {
        this.ensurePageContentsArray(pageIndex);

        const page = this.#pdfDoc.getPage(pageIndex);
        const pageContents = page.node.lookup(PDFName.Contents, PDFArray);
        pageContents.push(visualRef);
        this.#docSnapshot.markRefForSave(page.ref);
    }

    addPageResource(resourceRef: PDFRef, pageIndex: number, name: string): void {
        this.ensurePageResourcesXObject(pageIndex);

        const page = this.#pdfDoc.getPage(pageIndex);
        const resources = page.node.lookup(PDFName.Resources, PDFDict);
        const xObject = resources.lookup(PDFName.XObject, PDFDict);
        const pdfName = PDFName.of(name);
        xObject.set(pdfName, resourceRef);
        this.markForSave(page, PDFName.Resources);
    }

    registerStream(drawBuffer: string, visualObj: any): PDFRef {
        const visual = this.#pdfDoc.context.stream(drawBuffer, visualObj);
        return this.#pdfDoc.context.register(visual);
    }

    markObjAsChanged(obj: PDFObject): void {
        this.#docSnapshot.markObjForSave(obj);
    }

    async saveAsync(): Promise<Uint8Array> {
        let incrementalPdf = await this.#pdfDoc.saveIncremental(this.#docSnapshot);
        incrementalPdf = updateByteRange(incrementalPdf, this.#pdf.length);

        return mergeUint8Arrays([
            this.#pdf,
            incrementalPdf
        ]);
    }

    getPlaceholderRanges(): PdfByteRanges {
        const signatureRefs = this.getSignatureRefs();
        const lastSignatureRef = _.last(signatureRefs);

        if(!lastSignatureRef) {
            throw new NoPlaceholderError();
        }
    
        const lastSignature = this.#pdfDoc.context.lookup(lastSignatureRef, PDFDict);
        return getPdfRangesFromSignature(lastSignature);
    }

    ensureAcroForm(): void {
        if(this.#pdfDoc.catalog.AcroForm()) {
            return;
        }

        this.#pdfDoc.catalog.getOrCreateAcroForm();
        this.#docSnapshot.markObjForSave(this.#pdfDoc.catalog);

        const formDict = this.#pdfDoc.getForm().acroForm.dict;
        if(formDict.has(PDFNameEx.SigFlags)) {
            return;
        }

        const three = PDFNumber.of(3);
        formDict.set(PDFNameEx.SigFlags, three);
    }

    ensurePageAnnots(pageIndex: number): void {
        const page = this.#pdfDoc.getPage(pageIndex);
        this.#docSnapshot.markRefForSave(page.ref);

        let annots = page.node.lookupMaybe(PDFName.Annots, PDFArray);
        if(annots) {
            return;
        }
    
        annots = this.#pdfDoc.context.obj([]);
        page.node.set(PDFName.Annots, annots);
    }

    ensurePageContentsArray(pageIndex: number): void {
        const page = this.#pdfDoc.getPage(pageIndex);
        const pageContents = page.node.get(PDFName.Contents);
        if(pageContents instanceof PDFArray) {
            return;
        }

        const newPageContents = this.#pdfDoc.context.obj([ pageContents ]);
        page.node.set(PDFName.Contents, newPageContents);
        this.#docSnapshot.markRefForSave(page.ref);
    }

    ensurePageResourcesXObject(pageIndex: number): void {
        const page = this.#pdfDoc.getPage(pageIndex);
        const resources = page.node.lookup(PDFName.Resources, PDFDict);
        if(resources.get(PDFName.XObject)) {
            return;
        }
            
        const xObject = this.#pdfDoc.context.obj({});
        resources.set(PDFName.XObject, xObject);
        this.markForSave(page, PDFName.Resources);
    }

    ensureSignatureFont(pageHint: number | PDFRef): void {
        const page = this.getPageDict(pageHint);
        const resources = page.lookup(PDFName.Resources, PDFDict);
        const fontDict = resources.lookup(PDFName.Font, PDFDict);
        if(fontDict.has(PDFNameEx.Helvetica)) {
            return;
        }

        const fontRef = this.registerFont(PDFNameEx.Helvetica);
        fontDict.set(PDFNameEx.Helvetica, fontRef);
        this.markForSaveDict(page, PDFName.Resources);
    }

    async embedImageAsync(image: ArrayBuffer | Buffer): Promise<PDFRef> {
        let img: PDFImage;
        try { 
            img = await this.#pdfDoc.embedJpg(image);
        } catch {
            try {
                img = await this.#pdfDoc.embedPng(image);
            } catch {
                throw new InvalidImageError();
            }
        }
        await img.embed();
    
        return img.ref;
    }   

    getSignatureRefs(): PDFDict[] {
        if(!this.#pdfDoc.catalog.AcroForm()) {
            return [];
        }

        const formDict = this.#pdfDoc.getForm().acroForm.dict;
        const formFields = formDict.lookup(PDFNameEx.Fields, PDFArray);

        return formFields.asArray()
            .filter(ref => {
                const dict = this.#pdfDoc.context.lookupMaybe(ref, PDFDict);
                if(!dict) {
                    return false;
                }
                return dict.lookupMaybe(PDFNameEx.FT, PDFName) == PDFNameEx.Sig
                        && dict.lookupMaybe(PDFName.Type, PDFName) == PDFNameEx.Annot
                        && dict.lookupMaybe(PDFNameEx.Subtype, PDFName) == PDFNameEx.Widget;
            })
            .map(obj => obj as PDFRef)
            .map(ref => this.#pdfDoc.context.lookup(ref, PDFDict));
    }

    getSignature(name: string): PDFDict {
        const signatures = this.getSignatureRefs();
        for(let i= 0; i < signatures.length; i++) {
            const signature = this.#pdfDoc.context.lookup(signatures[i], PDFDict);
            if(signature.lookup(PDFNameEx.T, PDFString).asString() === name) {
                return signature;
            };
        };
        throw new SignatureNotFoundError(name);
    }

    getSignaturePageNumber(name: string): number {
        for(let i = 0; i < this.#pdfDoc.getPageCount(); i++) {
            const page = this.#pdfDoc.getPage(i);
            const annotRefs = page.node.Annots();
            if(!annotRefs) {
                continue;
            }
            for(let j = 0; j < annotRefs.size(); j++) {
                const annot = this.#pdfDoc.context.lookup(annotRefs.get(j), PDFDict);
                if(annot.lookupMaybe(PDFNameEx.T, PDFString)?.asString() == name) {
                    return i + 1;
                }
            } 
        }
        throw new SignatureNotFoundError(name);
    }

    getSignatureBuffer(signature: PDFDict): Uint8Array {
        const signRanges = getPdfRangesFromSignature(signature); 
        return getSignBuffer(this.#pdf, signRanges);
    }

    isSignatureForEntireDocument(signature: PDFDict): boolean {
        const signRanges = getPdfRangesFromSignature(signature); 
        return signRanges.after.start + signRanges.after.length === this.#pdf.length;
    }
    
    getSignatureCount(): number {
        return this.getSignatureRefs().length;
    }

    getFields(): PDFDict[] {
        return this.getSignatureRefs()
            .map(ref => this.#pdfDoc.context.lookup(ref, PDFDict))
            .filter(dict => !dict.has(PDFNameEx.V));
    }

    getPageSize(pageIndex: number): Size {
        const page = this.#pdfDoc.getPage(pageIndex);
        
        return page.getSize();
    }

    getPageRef(pageIndex: number): PDFRef {
        const page = this.#pdfDoc.getPage(pageIndex);

        return page.ref;
    }

    getDict(ref: PDFRef): PDFDict {
        return this.#pdfDoc.context.lookup(ref, PDFDict);
    }

    private markForSave(page: PDFPage, name: PDFName) {
        const obj = page.node.get(name);
        if(obj instanceof PDFRef) {
            this.#docSnapshot.markRefForSave(obj);
        } else {
            this.#docSnapshot.markRefForSave(page.ref);
        }
    }

    private markForSaveDict(pageDict: PDFDict, name: PDFName) {
        const obj = pageDict.get(name);
        if(obj instanceof PDFRef) {
            this.#docSnapshot.markRefForSave(obj);
        } else {
            this.#docSnapshot.markObjForSave(pageDict);
        }
    }

    private getPageDict(pageHint: number | PDFRef): PDFDict {
        if(pageHint instanceof PDFRef) {
            return this.#pdfDoc.context.lookup(pageHint, PDFDict);
        } else {
            return this.#pdfDoc.getPage(pageHint).node;
        }
    }

    private registerFont(name: PDFName): PDFRef {
        const font = this.#pdfDoc.context.obj({
            'Type': 'Font',
            'Subtype': 'Type1',
            'BaseFont': name,
            'Encoding': 'WinAnsiEncoding'
        });
        return this.#pdfDoc.context.register(font);
    }
}
