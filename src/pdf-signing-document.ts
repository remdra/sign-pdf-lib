import { PdfByteRanges, Size } from './models';
import { NoPlaceholderError, SignatureNotFoundError } from './errors';

import { DocumentSnapshot, PDFArray, PDFContext, PDFDict, PDFDocument, PDFImage, PDFName, PDFNumber, PDFObject, PDFRef, PDFString } from 'pdf-lib';
import * as _ from 'lodash';

function getSignatureRange(pdf: Buffer) {
    let contentsStartIndex = 0;
    while(pdf[contentsStartIndex] != '<'.charCodeAt(0)) {
        contentsStartIndex = pdf.indexOf('/Contents', contentsStartIndex) + '/Contents'.length;
        while(pdf[contentsStartIndex] == ' '.charCodeAt(0)) {
            contentsStartIndex++;
        }
    }
    const start = pdf.indexOf('<', contentsStartIndex) + 1;
    const end = pdf.indexOf('>', start);

    return {
        start,
        end
    };
}

function getPdfSigningRanges(initialPdfLength: number, incrementalPdf: Buffer): PdfByteRanges {
    const { start: startSignature, end: endSignature } = getSignatureRange(incrementalPdf);

    return {
        before: {
            start: 0,
            length: initialPdfLength + startSignature - 1
        },
        signature: {
            start: initialPdfLength + startSignature - 1,
            length: endSignature - startSignature + 2
        },
        after: {
            start: initialPdfLength + endSignature + 1,
            length: incrementalPdf.length - endSignature - 1
        }
    };
}

function updateByteRange(incrementalPdf: Buffer, initialPdfLength: number): Buffer | undefined {
    const byteRangeStartIndex = incrementalPdf.indexOf('/ByteRange');
    if(byteRangeStartIndex < 0) {
        return undefined;
    }

    const { before, after } = getPdfSigningRanges(initialPdfLength, incrementalPdf);

    const byteRangeArray = PDFContext.create().obj([ before.start, before.length, after.start, after.length ]);
    const startOfByteRange = incrementalPdf.indexOf('[', byteRangeStartIndex);
    const endOfByteRange = incrementalPdf.indexOf(']', startOfByteRange) + 1;
    if(endOfByteRange - startOfByteRange < byteRangeArray.sizeInBytes()) {
        throw new Error('Not enough space to store range.');
    }
    const byteRangeBuffer = Buffer.from(' '.repeat(endOfByteRange - startOfByteRange));
    byteRangeArray.copyBytesInto(byteRangeBuffer, 0);

    return Buffer.concat([ 
        incrementalPdf.subarray(0, startOfByteRange),
        byteRangeBuffer,
        incrementalPdf.subarray(endOfByteRange)
    ]);
}


function getPdfRangesFromSignature(signature: PDFDict): PdfByteRanges {
    if(!signature.get(PDFName.of('V'))) {
        throw new NoPlaceholderError();
    }

    const signatureV = signature.lookup(PDFName.of('V'), PDFDict);
    const byteRange = signatureV.lookup(PDFName.of('ByteRange'), PDFArray);

    const start1 = (byteRange.get(0) as PDFNumber).asNumber();
    const length1 = (byteRange.get(1) as PDFNumber).asNumber();
    const start2 = (byteRange.get(2) as PDFNumber).asNumber();
    const length2 = (byteRange.get(3) as PDFNumber).asNumber();


    return {
        before: {
            start: start1,
            length: length1
        },
        signature: {
            start: start1 + length1,
            length: start2 - (start1 + length1)
        },
        after: {
            start: start2,
            length: length2
        }
    };
}

export class PdfSigningDocument {

    #pdfDoc: PDFDocument;
    #pdf: Buffer;
    #docSnapshot: DocumentSnapshot;

    static async fromPdfAsync(pdf: Buffer): Promise<PdfSigningDocument> {
        const pdfDoc = await PDFDocument.load(pdf);

        return new PdfSigningDocument(pdfDoc, pdf);
    }

    private constructor(pdfDoc: PDFDocument, pdf: Buffer) {
        this.#pdfDoc = pdfDoc;
        this.#pdf = pdf;

        if(pdfDoc.context.pdfFileDetails.useObjectStreams) { pdfDoc.context.largestObjectNumber += 1; };
        this.#docSnapshot = pdfDoc.takeSnapshot();
    }

    registerDict(dict: any): PDFRef {
        const obj = this.#pdfDoc.context.obj(dict) as any as PDFDict;
        return this.#pdfDoc.context.register(obj);
    }

    getPageSize(pageIndex: number): Size {
        return this.#pdfDoc.getPage(pageIndex).getSize();
    }

    getPageRef(pageIndex: number): PDFRef {
        return this.#pdfDoc.getPage(pageIndex).ref;
    }

    getDict(ref: PDFRef): PDFDict {
        return this.#pdfDoc.context.lookup(ref, PDFDict);
    }

    addDict(dict: any): PDFDict {
        return this.#pdfDoc.context.obj(dict) as any as PDFDict;
    }

    addPageAnnot(pageIndex: number, annotRef: PDFRef): void {
        const page = this.#pdfDoc.getPage(pageIndex);
        const pageAnnots = page.node.lookup(PDFName.of('Annots'), PDFArray);
        pageAnnots.push(annotRef);
    }

    addFormField(fieldRef: PDFRef): void {
        const formDict = this.#pdfDoc.getForm().acroForm.dict;
        const formFields = formDict.lookup(PDFName.of('Fields'), PDFArray);
        formFields.push(fieldRef);
        this.#docSnapshot.markObjForSave(formDict)
    }

    addPageContent(visualRef: PDFRef, pageIndex: number): void {
        this.ensurePageContentsArray(pageIndex);

        const page = this.#pdfDoc.getPage(pageIndex);
        const pageContents = page.node.lookup(PDFName.of('Contents'), PDFArray);
        pageContents.push(visualRef);
        this.#docSnapshot.markRefForSave(page.ref);

    }

    addPageResource(resourceRef: PDFRef, pageIndex: number): void {
        this.ensurePageResourcesXObject(pageIndex);

        const page = this.#pdfDoc.getPage(pageIndex);
        const resources = page.node.lookup(PDFName.of('Resources'), PDFDict);
        const xObject = resources.lookup(PDFName.of('XObject'), PDFDict);
        xObject.set(PDFName.of('background1'), resourceRef);
        if(page.node.get(PDFName.of('Resources')) instanceof PDFRef) {
            this.#docSnapshot.markRefForSave(page.node.get(PDFName.of('Resources')) as PDFRef);
        } else {
            this.#docSnapshot.markRefForSave(page.ref);
        }
    }

    registerStream(drawBuffer: string, visualObj: any): PDFRef {
        const visual = this.#pdfDoc.context.stream(drawBuffer, visualObj);
        return this.#pdfDoc.context.register(visual);
    }

    markObjAsChanged(obj: PDFObject): void {
        this.#docSnapshot.markObjForSave(obj);
    }

    async saveAsync(): Promise<Buffer> {
        let incrementalPdf = Buffer.from(await this.#pdfDoc.saveIncremental(this.#docSnapshot));
        incrementalPdf = updateByteRange(incrementalPdf, this.#pdf.length) || incrementalPdf;

        return Buffer.concat([
            this.#pdf,
            incrementalPdf
        ]);
    }

    getPlaceholderRanges(): PdfByteRanges {
        const signatureRefs = this.getSignatures();
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
        if(!formDict.has(PDFName.of('SigFlags'))) {
            formDict.set(PDFName.of('SigFlags'), PDFNumber.of(3));
        }
    }

    ensurePageAnnots(pageIndex: number): void {
        const page = this.#pdfDoc.getPage(pageIndex);
        this.#docSnapshot.markRefForSave(page.ref);

        let annots = page.node.lookupMaybe(PDFName.of('Annots'), PDFArray);
        if(annots) {
            return;
        }
    
        annots = this.#pdfDoc.context.obj([]);
        page.node.set(PDFName.of('Annots'), annots);
    }

    ensurePageContentsArray(pageIndex: number): void {
        const page = this.#pdfDoc.getPage(pageIndex);
        const pageContents = page.node.get(PDFName.of('Contents'));
        if(pageContents instanceof PDFArray) {
            return;
        }
        const newPageContents = this.#pdfDoc.context.obj([ pageContents ]);
        page.node.set(PDFName.of('Contents'), newPageContents);
        this.#docSnapshot.markRefForSave(page.ref);
    }

    ensurePageResourcesXObject(pageIndex: number): void {
        const page = this.#pdfDoc.getPage(pageIndex);
        const resources = page.node.lookup(PDFName.of('Resources'), PDFDict);
        if(!resources.get(PDFName.of('XObject'))) {
            const xObject = this.#pdfDoc.context.obj({});
            resources.set(PDFName.of('XObject'), xObject);
            if(page.node.get(PDFName.of('Resources')) instanceof PDFRef) {
                this.#docSnapshot.markRefForSave(page.node.get(PDFName.of('Resources')) as PDFRef);
            } else {
                this.#docSnapshot.markRefForSave(page.ref);
            }
        }
    }

    async embedImageAsync(image: Buffer): Promise<PDFRef> {
        let img: PDFImage;
        try { 
            img = await this.#pdfDoc.embedJpg(image);
        } catch {
            img = await this.#pdfDoc.embedPng(image);
        }
        await img.embed();
    
        return img.ref;
    }   

    getSignatures(): PDFRef[] {
        if(!this.#pdfDoc.catalog.AcroForm()) {
            return [];
        }

        const formDict = this.#pdfDoc.getForm().acroForm.dict;
        const formFields = formDict.lookup(PDFName.of('Fields'), PDFArray);

        return formFields.asArray()
            .filter(ref => {
                const dict = this.#pdfDoc.context.lookupMaybe(ref, PDFDict);
                if(!dict) {
                    return false;
                }
                return dict.lookupMaybe(PDFName.of('FT'), PDFName) == PDFName.of('Sig')
                        && dict.lookupMaybe(PDFName.of('Type'), PDFName) == PDFName.of('Annot')
                        && dict.lookupMaybe(PDFName.of('Subtype'), PDFName) == PDFName.of('Widget');
            })
            .map(obj => obj as PDFRef);
    }

    getSignature(name: string): PDFDict {
        const signatures = this.getSignatures();
        for(let i= 0; i < signatures.length; i++) {
            const signature = this.#pdfDoc.context.lookup(signatures[i], PDFDict);
            if(signature.lookup(PDFName.of('T'), PDFString).asString() === name) {
                return signature;
            };
        };
        throw new SignatureNotFoundError(name);
    }

    getSignatureCount(): number {
        return this.getSignatures().length;
    }

    embedSignatureFont({ pageIndex, pageRef }: { pageIndex?: number; pageRef?: PDFRef }): void {
        let page!: PDFDict;
        if(pageRef) {
            page = this.#pdfDoc.context.lookup(pageRef, PDFDict);
        } else if(pageIndex != undefined) {
            page = this.#pdfDoc.getPage(pageIndex).node;
        }
        const fontDict = page.lookup(PDFName.of('Resources'), PDFDict).lookup(PDFName.of('Font'), PDFDict);
        if(fontDict.has(PDFName.of('Helvetica'))) {
            return;
        }
        const font = this.#pdfDoc.context.obj({
            'Type': 'Font',
            'Subtype': 'Type1',
            'BaseFont': 'Helvetica',
            'Encoding': 'WinAnsiEncoding'
        });
        const fontRef = this.#pdfDoc.context.register(font);
        fontDict.set(PDFName.of('Helvetica'), fontRef);

        if(page.get(PDFName.of('Resources')) instanceof PDFRef) {
            this.#docSnapshot.markRefForSave(page.get(PDFName.of('Resources')) as PDFRef);
        } else {
            this.#docSnapshot.markObjForSave(page);
        }    
    }

}
