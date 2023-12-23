import { PdfByteRanges, Rectangle, SignatureText, Size } from './models';
import { SignatureParameters } from './models/parameters';
import { NoPlaceholderError, SignatureNotFoundError } from './errors';
import { computeAbsolutePageReverseRectangle } from './helpers';

import { DocumentSnapshot, PDFArray, PDFContext, PDFDict, PDFDocument, PDFHexString, PDFImage, PDFName, PDFNumber, PDFRef, PDFString } from 'pdf-lib';
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

class NameProvider {

    #signatureNumber: number;

    constructor(signatureNumber: number) {
        this.#signatureNumber = signatureNumber;
    }

    getFrmName(): string {
        return `frm${this.#signatureNumber}`;
    }

    getBackgroundName(): string {
        return `background${this.#signatureNumber}`;
    }

    getSignatureName(): string {
        return `Signature${this.#signatureNumber}`;
    }
}

export interface AddSignatureFieldParameters { 
    name?: string;
    pageIndex: number;
    rectangle?: Rectangle;
    visualRef?: PDFRef;
    placeholderRef?: PDFRef;
    embedFont: boolean
};

export interface AddVisualParameters { 
    background?: Buffer; 
    texts?: SignatureText[] 
};

export interface AddSignaturePlaceholderParameters extends SignatureParameters { 
    signaturePlaceholder: string; 
    rangePlaceHolder: number;
};

export interface UpdateSignatureParameters { 
    placeholderRef: PDFRef;
    visualRef?: PDFRef;
    embedFont: boolean;
};

export class PdfDocumentDigitalSigner {

    #pdfDoc: PDFDocument;
    #pdf: Buffer;
    #docSnapshot: DocumentSnapshot;
    #nameProvider: NameProvider;

    static async fromPdfAsync(pdf: Buffer): Promise<PdfDocumentDigitalSigner> {
        const pdfDoc = await PDFDocument.load(pdf);

        return new PdfDocumentDigitalSigner(pdfDoc, pdf);
    }

    private constructor(pdfDoc: PDFDocument, pdf: Buffer) {
        this.#pdfDoc = pdfDoc;
        this.#pdf = pdf;

        if(pdfDoc.context.pdfFileDetails.useObjectStreams) { pdfDoc.context.largestObjectNumber += 1; };
        this.#docSnapshot = pdfDoc.takeSnapshot();

        this.#nameProvider = new NameProvider(this.getSignatureCount() + 1);
    }

    addSignatureField({ name, pageIndex, rectangle, visualRef, placeholderRef, embedFont }: AddSignatureFieldParameters): void {
        this.ensureAcroForm();
        this.ensurePageAnnots(pageIndex);

        name = name || this.#nameProvider.getSignatureName();

        const page = this.#pdfDoc.getPage(pageIndex);
        const pageRect = computeAbsolutePageReverseRectangle(rectangle, page.getSize());

        const signature: any = {
            'FT': 'Sig',
            'Type': 'Annot',
            'Subtype': 'Widget',
            'T': PDFString.of(name),
            'F': 132,
            'P': page.ref,
            'Rect': [ pageRect.left, pageRect.top, pageRect.right, pageRect.bottom ]
        };
        if(visualRef) {
            signature['AP'] = {
                'N': visualRef
            };
        };
        if(placeholderRef) {
            signature['V'] = placeholderRef;
        }
        
        const field = this.#pdfDoc.context.obj(signature) as any as PDFDict;
        const fieldRef = this.#pdfDoc.context.register(field);

        const pageAnnots = page.node.lookup(PDFName.of('Annots'), PDFArray);
        pageAnnots.push(fieldRef);

        const formDict = this.#pdfDoc.getForm().acroForm.dict;
        const formFields = formDict.lookup(PDFName.of('Fields'), PDFArray);
        formFields.push(fieldRef);

        this.#docSnapshot.markObjForSave(formDict);

        if(embedFont) {
            this.embedSignatureFont(page.node);
        }
    }

    async addVisualAsync({ background, texts }: AddVisualParameters): Promise<PDFRef | undefined> {
        if(!background && !texts) {
            return undefined;
        }

        let backgroundRef;
        if(background) {
            backgroundRef = await this.embedImageAsync(background);
            const drawBuffer2 = `q 1 0 0 1 0 0 cm /${this.#nameProvider.getBackgroundName()} Do Q`;

            const r = this.#pdfDoc.context.stream(drawBuffer2, {
                'Type': 'XObject',
                'Subtype': 'Form',
                'BBox': [ 0.0, 0.0, 214.0, 70.0 ],
                'Resources': {
                    'XObject': {
                        [`${this.#nameProvider.getBackgroundName()}`]: backgroundRef
                    }
                }
            });
            backgroundRef = this.#pdfDoc.context.register(r);    
        }
        
        let drawBuffer = backgroundRef 
            ? `q 214 0 0 70 0 0 cm /${this.#nameProvider.getFrmName()} Do Q`
            : '';
        if(texts) {
            drawBuffer = drawBuffer
                + ' q'
                + ' 0 0 106 68 re'
                + ' BT'
                + ' /Helvetica 1 Tf'
                + ' 0 Tc 0 Tw 0 Ts 100 Tz 0 Tr'
                + ' 27.849 0 0 27.849 1 43.646 Tm'
                + ` (${texts[0].lines[0]})Tj`
                + ' 0 -1.2 TD'
                + ` (${texts[0].lines[1]})Tj`
                + ' 12.637 0 0 12.637 109.1188 54.087 Tm'
                + ` (${texts[1].lines[0]})Tj`
                + ' T*'
                + ` (${texts[1].lines[1]})Tj`
                + ' T*'
                + ` (${texts[1].lines[2]})Tj`
                + ' T*'
                + ` (${texts[1].lines[3]})Tj`
                + ' ET'
                + ' Q';
        }
    
        const visualObj: any = {
            'FT': 'XObject',
            'Subtype': 'Form',
            'BBox': [ 0.0, 0.0, 214, 70.0 ],
            'Resources': {}
        }
    
        if(backgroundRef) { 
            visualObj['Resources']['XObject'] = {
                [`${this.#nameProvider.getFrmName()}`]: backgroundRef
            }
        }
    
        const visual = this.#pdfDoc.context.stream(drawBuffer, visualObj);
        return this.#pdfDoc.context.register(visual);
    }

    addEmptyVisual(): PDFRef {
        const drawBuffer = '% DSBlank';
    
        const visualObj: any = {
            'FT': 'XObject',
            'Subtype': 'Form',
            'BBox': [ 0.0, 0.0, 214, 70.0 ],
        }
    
        const visual = this.#pdfDoc.context.stream(drawBuffer, visualObj);
        return this.#pdfDoc.context.register(visual);
    }

    addSignaturePlaceholder({ name, reason, location, contactInfo, date, signaturePlaceholder, rangePlaceHolder }: AddSignaturePlaceholderParameters): PDFRef {

        const signature: any = {
            'Type': 'Sig',
            'Filter': 'Adobe.PPKLite',
            'SubFilter': 'adbe.pkcs7.detached',
            'Contents': PDFHexString.of(signaturePlaceholder),
            'ByteRange': [ 0, rangePlaceHolder, rangePlaceHolder, rangePlaceHolder ]
        };
        if(name) { signature['Name'] = PDFString.of(name); };
        if(location) { signature['Location'] = PDFString.of(location); };
        if(reason) { signature['Reason'] = PDFString.of(reason); };
        if(date) { signature['M'] = PDFString.fromDate(date); };
        if(contactInfo) { signature['ContactInfo'] = PDFString.of(contactInfo); };
        
        const placeholder = this.#pdfDoc.context.obj(signature) as any as PDFDict; 
        return this.#pdfDoc.context.register(placeholder);
    }

    updateSignature(name: string, { placeholderRef, visualRef, embedFont }: UpdateSignatureParameters): void {
        const signature = this.getSignature(name);
        if(signature.get(PDFName.of('V'))) {
            throw new Error('Already signed.');
        }
        signature.set(PDFName.of('V'), placeholderRef);
        if(visualRef) {
            if(!signature.get(PDFName.of('AP'))) {
                signature.set(PDFName.of('AP'), this.#pdfDoc.context.obj({}));
            }
            signature.lookup(PDFName.of('AP'), PDFDict).set(PDFName.of('N'), visualRef);
        } else {
            signature.delete(PDFName.of('AP'));
        }
        this.#docSnapshot.markObjForSave(signature);

        if(embedFont) {
            this.embedSignatureFont(signature.lookup(PDFName.of('P'), PDFDict));
        }
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

    private ensureAcroForm() {
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

    private ensurePageAnnots(pageIndex: number) {
        const page = this.#pdfDoc.getPage(pageIndex);
        this.#docSnapshot.markRefForSave(page.ref);

        let annots = page.node.lookupMaybe(PDFName.of('Annots'), PDFArray);
        if(annots) {
            return;
        }
    
        annots = this.#pdfDoc.context.obj([]);
        page.node.set(PDFName.of('Annots'), annots);
    }

    private async embedImageAsync(image: Buffer): Promise<PDFRef> {
        let img: PDFImage;
        try { 
            img = await this.#pdfDoc.embedJpg(image);
        } catch {
            img = await this.#pdfDoc.embedPng(image);
        }
        await img.embed();
    
        return img.ref;
    }   

    private getSignatures(): PDFRef[] {
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

    private getSignature(name: string): PDFDict {
        const signatures = this.getSignatures();
        for(let i= 0; i < signatures.length; i++) {
            const signature = this.#pdfDoc.context.lookup(signatures[i], PDFDict);
            if(signature.lookup(PDFName.of('T'), PDFString).asString() === name) {
                return signature;
            };
        };
        throw new SignatureNotFoundError(name);
    }

    private getSignatureCount(): number {
        return this.getSignatures().length;
    }

    private embedSignatureFont(page: PDFDict): void {
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
