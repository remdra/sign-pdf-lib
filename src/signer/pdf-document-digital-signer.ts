import { SignDocumentBasic } from './new-sign-document-basic';
import { PdfByteRanges, Rectangle, SignatureText } from '../models';
import { hasTextContentEx, PlaceholderMaskParameters, SignatureParameters, SignatureVisualParameters } from '../models/parameters';
import { computeAbsolutePageReverseRectangle, escapeString } from '../helpers';
import { AlreadySignedError } from '../errors';

import { beginText, concatTransformationMatrix, drawObject, endText, nextLine, PDFDict, PDFHexString, PDFName, PDFNumber, PDFOperator, PDFOperatorNames, PDFRef, PDFString, popGraphicsState, pushGraphicsState, rectangle, setCharacterSpacing, setCharacterSqueeze, setFontAndSize, setTextMatrix, setTextRenderingMode, setTextRise, setWordSpacing, showText, TextRenderingMode } from 'pdf-lib';


class PDFNameEx { ////////////////
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

const showTextEx = (text: string) =>
            PDFOperator.of(PDFOperatorNames.ShowText, [PDFString.of(text)])


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

export interface AddVisualParameters { /*check*/
    background?: ArrayBuffer | Buffer; /*tested*/
    texts?: SignatureText[] 
};

export interface AddSignaturePlaceholderParameters extends SignatureParameters { 
    signatureMask: string; 
    offsetMask: number;
};

export interface UpdateSignatureParameters { 
    placeholderRef: PDFRef;
    visualRef?: PDFRef;
    embedFont: boolean;
};

export class PdfDocumentDigitalSigner {

    #signingDoc: SignDocumentBasic;
    #nameProvider: NameProvider;

    static async addSignaturePlaceholderForFieldAsync(
        pdf: ArrayBuffer | Buffer | Uint8Array, /*tested*/
        fieldName: string,
        placeholderParameters: PlaceholderMaskParameters,
        signatureParameters?: SignatureParameters,
        signatureVisualParameters?: SignatureVisualParameters
    ): Promise<Uint8Array> {
        const pdfDocSigner = await PdfDocumentDigitalSigner.fromPdfAsync(pdf);
        const placeholderRef = pdfDocSigner.addSignaturePlaceholder({
            ...signatureParameters,
            ...placeholderParameters,
        });
        const visualRef = await pdfDocSigner.addVisualAsync(signatureVisualParameters);
        const embedFont = hasTextContentEx(signatureVisualParameters);
        pdfDocSigner.updateSignature(fieldName, {
            placeholderRef,
            visualRef,
            embedFont,
        });

        return await pdfDocSigner.saveAsync();
    }

    static async fromPdfAsync(pdf: ArrayBuffer | Buffer | Uint8Array): Promise<PdfDocumentDigitalSigner> { /*tested*/
        const signingDoc = await SignDocumentBasic.fromPdfAsync(pdf);

        return new PdfDocumentDigitalSigner(signingDoc);
    }

    private constructor(signingDoc: SignDocumentBasic) {
        this.#signingDoc = signingDoc;
        
        this.#nameProvider = new NameProvider(this.#signingDoc.getSignatureFieldCount() + 1);
    }

    addSignatureField({ name, pageIndex, rectangle, visualRef, placeholderRef, embedFont }: AddSignatureFieldParameters): void {
        this.#signingDoc.ensureAcroForm();
        this.#signingDoc.ensurePageAnnots(pageIndex);

        name = name ?? this.#nameProvider.getSignatureName();

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
            this.#signingDoc.ensureSignatureFontOld(pageIndex);
        }
    }

    async addVisualAsync({ background, texts }: AddVisualParameters = {}): Promise<PDFRef | undefined> {
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
            backgroundRef = this.#signingDoc.registerStreamOld(drawBuffer2, visualObj2);    
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
        
        const ops = [
            pushGraphicsState(),
            concatTransformationMatrix(214, 0, 0, 70, 0, 0),
            drawObject(this.#nameProvider.getFrmName()),
            popGraphicsState(),

            pushGraphicsState(),
            rectangle(0, 0, 106, 68),
            beginText(),
            setFontAndSize(PDFNameEx.Helvetica, 1),
            setCharacterSpacing(0),
            setWordSpacing(0),
            setTextRise(0),
            setCharacterSqueeze(100),
            setTextRenderingMode(TextRenderingMode.Fill),
            setTextMatrix(27.849, 0, 0, 27.849, 1, 43.646),
            showTextEx(texts[0].lines[0]),
            PDFOperator.of(PDFOperatorNames.MoveTextSetLeading, [PDFNumber.of(0), PDFNumber.of(-1.2)]),
            showTextEx(texts[0].lines[1]),
            setTextMatrix(12.637, 0, 0, 12.637, 109.1188, 54.087),
            showTextEx(texts[1].lines[0]),
            nextLine(),
            showTextEx(texts[1].lines[1]),
            nextLine(),
            showTextEx(texts[1].lines[2]),
            nextLine(),
            showTextEx(texts[1].lines[3]),
            endText(),
            popGraphicsState()
        ];
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
    
        return this.#signingDoc.registerStreamOld(drawBuffer, visualObj);
    }

    addEmptyVisual(): PDFRef {
        const drawBuffer = '% DSBlank';
    
        const visualObj: any = {
            'FT': 'XObject',
            'Subtype': 'Form',
            'BBox': [ 0.0, 0.0, 214, 70.0 ],
        }
    
        return this.#signingDoc.registerStreamOld(drawBuffer, visualObj);
    }

    addSignaturePlaceholder({ name, reason, location, contactInfo, date, signatureMask, offsetMask }: AddSignaturePlaceholderParameters): PDFRef {

        const signature2: any = {
            'Type': 'Sig',
            'Filter': 'Adobe.PPKLite',
            'SubFilter': 'adbe.pkcs7.detached',
            'Contents': PDFHexString.of(signatureMask),
            'ByteRange': [ 0, offsetMask, offsetMask, offsetMask ]
        };
        if(name) { signature2['Name'] = PDFString.of(escapeString(name)); };
        if(location) { signature2['Location'] = PDFString.of(escapeString(location)); };
        if(reason) { signature2['Reason'] = PDFString.of(escapeString(reason)); };
        if(date) { signature2['M'] = PDFString.fromDate(date); };
        if(contactInfo) { signature2['ContactInfo'] = PDFString.of(escapeString(contactInfo)); };
        
        return this.#signingDoc.registerDict(signature2); 
    }

    updateSignature(name: string, { placeholderRef, visualRef, embedFont }: UpdateSignatureParameters): void {
        const signature = this.#signingDoc.getSignatureField(name);
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

        if(embedFont) {///rename
            this.#signingDoc.ensureSignatureFont(signature.get(PDFName.of('P')) as PDFRef);
        }
    }

    async saveAsync(): Promise<Uint8Array> {
        return await this.#signingDoc.saveAsync();
    }

    getPlaceholderRanges(): PdfByteRanges {
        return this.#signingDoc.getPlaceholderRangesOld();
    }
}
