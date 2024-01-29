import { PdfSigningDocument } from './pdf-signing-document';
import { PdfByteRanges, Rectangle, SignatureText } from '../models';
import { SignatureParameters } from '../models/parameters';
import { computeAbsolutePageReverseRectangle } from '../helpers';
import { AlreadySignedError } from '../errors';

import { PDFDict, PDFHexString, PDFName, PDFRef, PDFString } from 'pdf-lib';

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

    #signingDoc: PdfSigningDocument;
    #nameProvider: NameProvider;

    static async fromPdfAsync(pdf: Buffer): Promise<PdfDocumentDigitalSigner> {
        const signingDoc = await PdfSigningDocument.fromPdfAsync(pdf);

        return new PdfDocumentDigitalSigner(signingDoc);
    }

    private constructor(signingDoc: PdfSigningDocument) {
        this.#signingDoc = signingDoc;
        
        this.#nameProvider = new NameProvider(this.#signingDoc.getSignatureCount() + 1);
    }

    addSignatureField({ name, pageIndex, rectangle, visualRef, placeholderRef, embedFont }: AddSignatureFieldParameters): void {
        this.#signingDoc.ensureAcroForm();
        this.#signingDoc.ensurePageAnnots(pageIndex);

        name = name || this.#nameProvider.getSignatureName();

        const pageSize = this.#signingDoc.getPageSize(pageIndex);
        const pageRect = computeAbsolutePageReverseRectangle(rectangle, pageSize);

        const signature: any = {
            'FT': 'Sig',
            'Type': 'Annot',
            'Subtype': 'Widget',
            'T': PDFString.of(name),
            'F': 132,
            'P': this.#signingDoc.getPageRef(pageIndex),
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
        
        const fieldRef = this.#signingDoc.registerDict(signature);
        this.#signingDoc.addPageAnnot(pageIndex, fieldRef);
        this.#signingDoc.addFormField(fieldRef);

        if(embedFont) {
            this.#signingDoc.embedSignatureFont(pageIndex);
        }
    }

    async addVisualAsync({ background, texts }: AddVisualParameters): Promise<PDFRef | undefined> {
        if(!background && !texts) {
            return undefined;
        }

        let backgroundRef;
        if(background) {
            backgroundRef = await this.#signingDoc.embedImageAsync(background);
            const drawBuffer2 = `q 1 0 0 1 0 0 cm /${this.#nameProvider.getBackgroundName()} Do Q`;

            const visualObj2 = {
                'Type': 'XObject',
                'Subtype': 'Form',
                'BBox': [ 0.0, 0.0, 214.0, 70.0 ],
                'Resources': {
                    'XObject': {
                        [`${this.#nameProvider.getBackgroundName()}`]: backgroundRef
                    }
                }
            };
            backgroundRef = this.#signingDoc.registerStream(drawBuffer2, visualObj2);    
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
    
        return this.#signingDoc.registerStream(drawBuffer, visualObj);
    }

    addEmptyVisual(): PDFRef {
        const drawBuffer = '% DSBlank';
    
        const visualObj: any = {
            'FT': 'XObject',
            'Subtype': 'Form',
            'BBox': [ 0.0, 0.0, 214, 70.0 ],
        }
    
        return this.#signingDoc.registerStream(drawBuffer, visualObj);
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
        
        return this.#signingDoc.registerDict(signature); 
    }

    updateSignature(name: string, { placeholderRef, visualRef, embedFont }: UpdateSignatureParameters): void {
        const signature = this.#signingDoc.getSignature(name);
        if(signature.get(PDFName.of('V'))) {
            throw new AlreadySignedError(name);
        }
        signature.set(PDFName.of('V'), placeholderRef);
        if(visualRef) {
            if(!signature.get(PDFName.of('AP'))) {
                signature.set(PDFName.of('AP'), this.#signingDoc.addDict({}));
            }
            signature.lookup(PDFName.of('AP'), PDFDict).set(PDFName.of('N'), visualRef);
        } else {
            signature.delete(PDFName.of('AP'));
        }
        this.#signingDoc.markObjAsChanged(signature);

        if(embedFont) {
            this.#signingDoc.embedSignatureFont(signature.get(PDFName.of('P')) as PDFRef);
        }
    }

    async saveAsync(): Promise<Buffer> {
        return await this.#signingDoc.saveAsync();
    }

    getPlaceholderRanges(): PdfByteRanges {
        return this.#signingDoc.getPlaceholderRanges();
    }
}
