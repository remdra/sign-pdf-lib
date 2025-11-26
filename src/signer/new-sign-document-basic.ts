import { Interval, PdfByteRanges, Size } from '../models';
import { AlreadySignedError, InvalidImageError, NoPlaceholderError, NoSignatureFieldError, NotSignedError, TooSmallPlaceholderError } from '../errors';
import { getPdfRangesFromSignature, toBuffer, toUint8Array } from '../helpers';
import { PDFNameEx } from '../hacks';

import { DocumentSnapshot, mergeIntoTypedArray, mergeUint8Arrays, PDFArray, PDFContentStream, PDFDict, PDFDocument, PDFHexString, PDFImage, PDFName, PDFNumber, PDFObject, PDFOperator, PDFPage, PDFRef, PDFString } from 'pdf-lib';
import * as _ from 'lodash';
import { getSignBuffer, loadPdfDocumentAsync, updateByteRange } from './tmp';


function isSignature(str: string): boolean {
    return str.split('').some(ch => ch != str[0]);
}

export class SignDocumentBasic {

    #pdfDoc: PDFDocument;
    #pdf: Uint8Array;
    #docSnapshot: DocumentSnapshot;

    static async embedSignatureAsync(pdf: ArrayBuffer | Buffer | Uint8Array, signature: string | Buffer | ArrayBuffer): Promise<Uint8Array> {
        const signDoc = await SignDocumentBasic.fromPdfAsync(pdf);

        const signatureInterval = signDoc.getSignatureIntervalForThePlaceholder();
        const hexSignature = signDoc.toHexString(signature);
        if(signatureInterval.length < hexSignature.length) {
            throw new TooSmallPlaceholderError();
        }
        
        const diffLength = signatureInterval.length - hexSignature.length;
        const fill = '0'.repeat(diffLength);
        const fullSignature = mergeIntoTypedArray(hexSignature, fill);

        signDoc.#pdf.set(fullSignature, signatureInterval.start);

        return signDoc.#pdf;
    }


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
        this.#docSnapshot.markRefForSave(page.ref);
    }

    addFormField(fieldRef: PDFRef): void {
        const formDict = this.#pdfDoc.getForm().acroForm.dict;
        const formFields = formDict.lookup(PDFNameEx.Fields, PDFArray);
        formFields.push(fieldRef);
        this.#docSnapshot.markObjForSave(formDict);
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

        const page = this.#pdfDoc.getPage(pageIndex).node;
        const resources = page.lookup(PDFName.Resources, PDFDict);
        const xObject = resources.lookup(PDFName.XObject, PDFDict);
        const pdfName = PDFName.of(name);
        xObject.set(pdfName, resourceRef);
        this.markForSave(page, PDFName.Resources);
    }

    registerStream(ops: PDFOperator[], obj: {}): PDFRef {
        const dict = this.#pdfDoc.context.obj(obj);
        const stream = PDFContentStream.of(dict, ops, false);
        return this.#pdfDoc.context.register(stream);
    }

    markObjAsChanged(obj: PDFObject): void {
        this.#docSnapshot.markObjForSave(obj);
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

    async saveAsync(): Promise<Uint8Array> {
        let incrementalPdf = await this.#pdfDoc.saveIncremental(this.#docSnapshot);
        incrementalPdf = updateByteRange(incrementalPdf, this.#pdf.length);

        return mergeUint8Arrays([
            this.#pdf,
            incrementalPdf
        ]);
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

        let annots = page.node.lookupMaybe(PDFName.Annots, PDFArray);
        if(annots) {
            return;
        }
    
        annots = this.#pdfDoc.context.obj([]);
        page.node.set(PDFName.Annots, annots);
        this.#docSnapshot.markRefForSave(page.ref);
    }

    ensurePageContentsArray(pageIndex: number): void {
        const page = this.#pdfDoc.getPage(pageIndex);
        const pageContents = page.node.get(PDFName.Contents);
        if(pageContents instanceof PDFArray) {
            return;
        }

        const contentArray = pageContents ? [ pageContents] : [];
        const newPageContents = this.#pdfDoc.context.obj(contentArray);
        page.node.set(PDFName.Contents, newPageContents);
        this.#docSnapshot.markRefForSave(page.ref);
    }

    ensurePageResourcesXObject(pageIndex: number): void {
        const page = this.#pdfDoc.getPage(pageIndex).node;
        this.ensurePageResources(page);
        const resources = page.lookup(PDFName.Resources, PDFDict);
        if(resources.has(PDFName.XObject)) {
            return;
        }
            
        const xObject = this.#pdfDoc.context.obj({});
        resources.set(PDFName.XObject, xObject);
        this.markForSave(page, PDFName.Resources);
    }

    ensureSignatureFont(pageRef: PDFRef): void {
        const page = this.#pdfDoc.context.lookup(pageRef, PDFDict);
        this.ensurePageResources(page);
        const resources = page.lookup(PDFName.Resources, PDFDict);
        if(!resources.has(PDFName.Font)) {
            const font = this.#pdfDoc.context.obj({});
            resources.set(PDFName.Font, font);
        }
        const fontDict = resources.lookup(PDFName.Font, PDFDict);
        if(fontDict.has(PDFNameEx.Helvetica)) {
            return;
        }

        const fontRef = this.registerFont(PDFNameEx.Helvetica);
        fontDict.set(PDFNameEx.Helvetica, fontRef);
        this.#docSnapshot.markRefForSave(pageRef);
    }

    getPdfByteIntervalsForThePlaceholder(): Interval[] {
        const placeholder = this.getThePlaceholder();
        const byteRange = placeholder.lookup(PDFNameEx.ByteRange, PDFArray);

        return this.convertByteRangeToIntervals(byteRange);
    }

    getPdfByteIntervalsForSignature(name: string): Interval[] {
        const signature = this.getSignature(name);
        const byteRange = signature.lookup(PDFNameEx.ByteRange, PDFArray);

        return this.convertByteRangeToIntervals(byteRange);
    }

    getSignatureFieldRefs(): PDFDict[] {
        if(!this.#pdfDoc.catalog.AcroForm()) {
            return [];
        }

        const formDict = this.#pdfDoc.getForm().acroForm.dict;
        const formFields = formDict.lookup(PDFNameEx.Fields, PDFArray);

        return formFields.asArray()
            .filter(ref => {
                const dict = this.#pdfDoc.context.lookup(ref, PDFDict);
                return dict.lookupMaybe(PDFNameEx.FT, PDFName) == PDFNameEx.Sig
                        && dict.lookupMaybe(PDFName.Type, PDFName) == PDFNameEx.Annot
                        && dict.lookupMaybe(PDFNameEx.Subtype, PDFName) == PDFNameEx.Widget;
            })
            .map(obj => obj as PDFRef)
            .map(ref => this.#pdfDoc.context.lookup(ref, PDFDict));
    }

    getSignatureField(name: string): PDFDict {
        const fields = this.getSignatureFieldRefs();
        for(let i = 0; i < fields.length; i++) {
            const signature = this.#pdfDoc.context.lookup(fields[i], PDFDict);
            if(signature.lookup(PDFNameEx.T, PDFString).asString() === name) {
                return signature;
            };
        };
        throw new NoSignatureFieldError(name);
    }

    getUnsignedField(name: string): PDFDict {
        const signature = this.getSignatureField(name);
        if(signature.has(PDFNameEx.V)) {
            throw new AlreadySignedError(name);
        }

        return signature;
    }

    getSignatureFieldPageNumber(name: string): number {
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
        throw new NoSignatureFieldError(name);
    }

    getPdfBytesForThePlaceholder(): Uint8Array {
        const intervals = this.getPdfByteIntervalsForThePlaceholder();
        return this.getPdfBytes(intervals)
    }

    getSignatureFieldCount(): number {
        return this.getSignatureFieldRefs().length;
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

    getThePlaceholder(): PDFDict {
        const fieldRefs = this.getSignatureFieldRefs();
        const lastFieldRef = _.last(fieldRefs);

        if(!lastFieldRef) {
            throw new NoPlaceholderError();
        }
    
        const lastField = this.#pdfDoc.context.lookup(lastFieldRef, PDFDict);
        if(!lastField.has(PDFNameEx.V)) {
            throw new NoPlaceholderError();
        }

        const placeholderV = lastField.lookup(PDFNameEx.V, PDFDict);
    
        const contents = placeholderV.lookup(PDFName.Contents, PDFHexString).asString();
        if(isSignature(contents)) {
            const name = lastField.lookup(PDFNameEx.T, PDFString).asString();
            throw new AlreadySignedError(name);
        }

        return placeholderV;
    }

    getSignature(name: string): PDFDict {
        const field = this.getSignatureField(name);
        if(!field.has(PDFNameEx.V)) {
            throw new NotSignedError(name);
        }

        const placeholderV = field.lookup(PDFNameEx.V, PDFDict);
        const contents = placeholderV.lookup(PDFName.Contents, PDFHexString).asString();
        if(!isSignature(contents)) {
            throw new NotSignedError(name);
        }

        return placeholderV;
    }

    private markForSave(page: PDFDict, name: PDFName): void {
        const obj = page.get(name);
        if(obj instanceof PDFRef) {
            this.#docSnapshot.markRefForSave(obj);
        } else {
            this.#docSnapshot.markObjForSave(page);
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

    private ensurePageResources(page: PDFDict): void {
        if(page.has(PDFName.Resources)) {
            return;
        }

        const resources = this.#pdfDoc.context.obj({});
        page.set(PDFName.Resources, resources);
    }

    private getPdfBytes(intervals: Interval[]): Uint8Array {
        const length = intervals.map(i => i.length).reduce((t, l) => t + l, 0);

        const buffer = new Uint8Array(length);
        let offset = 0;
        intervals.forEach(interval => {
            buffer.set(this.#pdf.subarray(interval.start, interval.start + interval.length), offset);
            offset += interval.length;
        });

        return buffer;
    }

    private convertByteRangeToIntervals(byteRange: PDFArray): Interval[] {
        return [{
            start: (byteRange.get(0) as PDFNumber).asNumber(),
            length: (byteRange.get(1) as PDFNumber).asNumber()
        }, {
            start: (byteRange.get(2) as PDFNumber).asNumber(),
            length: (byteRange.get(3) as PDFNumber).asNumber()
        }];
    }

    private getSignatureIntervalForThePlaceholder(): Interval {
        const pdfByteIntervals = this.getPdfByteIntervalsForThePlaceholder();

        const start = pdfByteIntervals[0].start + pdfByteIntervals[0].length + 1;
        const length = pdfByteIntervals[1].start - start - 1;

        return {
            start,
            length 
        };
    }

    private toHexString(signature: string | Buffer | ArrayBuffer): string {
        if(typeof signature === 'string') {
            return signature.toUpperCase();
        }

        return toBuffer(signature).toString('hex').toUpperCase();
    }

    ///////////////////////////remove
    ensureSignatureFontOld(pageIndex: number): void { /* FIXME: remove */
        const page = this.#pdfDoc.getPage(pageIndex);
        const pageDict = page.node;
        const resources = pageDict.lookup(PDFName.Resources, PDFDict);
        const fontDict = resources.lookup(PDFName.Font, PDFDict);
        if(fontDict.has(PDFNameEx.Helvetica)) {
            return;
        }

        const fontRef = this.registerFont(PDFNameEx.Helvetica);
        fontDict.set(PDFNameEx.Helvetica, fontRef);
        const obj = pageDict.get(PDFName.Resources);
        if(obj instanceof PDFRef) {
            this.#docSnapshot.markRefForSave(obj);
        } else {
            this.#docSnapshot.markRefForSave(page.ref);
        }

    }

    registerStreamOld(drawBuffer: string, visualObj: any): PDFRef { /*FIXME remove */
        const visual = this.#pdfDoc.context.stream(drawBuffer, visualObj);
        return this.#pdfDoc.context.register(visual);
    }

    getPlaceholderRangesOld(): PdfByteRanges { /*FIXME: remove */
        const signatureRefs = this.getSignatureFieldRefs();
        const lastSignatureRef = _.last(signatureRefs);

        if(!lastSignatureRef) {
            throw new NoPlaceholderError();
        }
    
        const lastSignature = this.#pdfDoc.context.lookup(lastSignatureRef, PDFDict);
        return getPdfRangesFromSignature(lastSignature);
    }

    getSignatureBufferOld(signature: PDFDict): Uint8Array {/*FIXME REMOVE */
        const signRanges = getPdfRangesFromSignature(signature); 
        return getSignBuffer(this.#pdf, signRanges);/////////////////
    }

    isSignatureForEntireDocumentOld(signature: PDFDict): boolean {/*FIXME REMOVE */
        const signRanges = getPdfRangesFromSignature(signature); 
        return signRanges.after.start + signRanges.after.length === this.#pdf.length;
    }
    
    getFieldsOld(): PDFDict[] { /*************** */
        return this.getSignatureFieldRefs()
            .map(ref => this.#pdfDoc.context.lookup(ref, PDFDict))
            .filter(dict => !dict.has(PDFNameEx.V));
    }
}
