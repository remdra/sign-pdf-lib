import { SignDocumentBasic } from './new-sign-document-basic';
import { Rectangle, SignatureText } from '../models';
import { PlaceholderParameters, SignatureParameters } from '../models/parameters';
import { escapeString } from '../helpers';
import { PDFNameEx } from '../hacks';

import { beginText, concatTransformationMatrix, drawObject, endText, nextLine, PDFDict, PDFHexString, PDFName, PDFNumber, PDFOperator, PDFOperatorNames, PDFRef, PDFString, popGraphicsState, pushGraphicsState, rectangle, setCharacterSpacing, setCharacterSqueeze, setFontAndSize, setTextMatrix, setTextRenderingMode, setTextRise, setWordSpacing, TextRenderingMode } from 'pdf-lib';

const showTextEx = (text: string) => PDFOperator.of(PDFOperatorNames.ShowText, [PDFString.of(text)])

const moveTextSetLeadingEx = (offsetX: number, offsetY: number) => PDFOperator.of(PDFOperatorNames.MoveTextSetLeading, [PDFNumber.of(offsetX), PDFNumber.of(offsetY)]);

export interface SignatureFieldParameters { 
    name: string;
    pageIndex: number;
    pageRect: Rectangle;
};

export type SignaturePlaceholderParameters = SignatureFieldParameters & SignaturePlaceholderForFieldParameters;

interface SignaturePlaceholderForFieldParameters {
    name: string;
    info?: SignatureParameters;
    visual?: SignatureVisualParametersEx;
    placeholder: PlaceholderParameters;
}

interface SignatureBackgroundParametersEx {
    background: {
        image: ArrayBuffer | Buffer;
        imageName: string;
        frmName: string;
    };
    texts?: SignatureText[];
}

export interface SignatureTextsParametersEx {
    background?: {
        image: ArrayBuffer | Buffer;
        imageName: string;
        frmName: string;
    };
    texts: SignatureText[];
}

export type SignatureVisualParametersEx = SignatureBackgroundParametersEx | SignatureTextsParametersEx;

interface UpdateSignatureFieldParameters { 
    placeholderRef: PDFRef;
    visualRef?: PDFRef;
    hasText: boolean;
};

function getSignatureMask(signatureMaxLen: number): string {
    return 'A'.repeat(signatureMaxLen);
}

function getOffsetMask(offsetMaxLen: number): number {
    return +'9'.repeat(offsetMaxLen)
}

export class SignDocument {

    #signDoc: SignDocumentBasic;

    static async embedSignatureAsync(pdf: ArrayBuffer | Buffer | Uint8Array, signature: string | Buffer | ArrayBuffer): Promise<Uint8Array> {
        return await SignDocumentBasic.embedSignatureAsync(pdf, signature);
    }

    static async fromPdfAsync(pdf: ArrayBuffer | Buffer | Uint8Array): Promise<SignDocument> {
        const signingDoc = await SignDocumentBasic.fromPdfAsync(pdf);

        return new SignDocument(signingDoc);
    }

    private constructor(signDoc: SignDocumentBasic) {
        this.#signDoc = signDoc;
    }

    addSignatureField(fieldParams: SignatureFieldParameters): void {
        this.#signDoc.ensureAcroForm();
        this.#signDoc.ensurePageAnnots(fieldParams.pageIndex);

        const signatureAnnot: any = {
            'FT': 'Sig',
            'Type': 'Annot',
            'Subtype': 'Widget',
            'T': PDFString.of(fieldParams.name),
            'F': 132,
            'P': this.#signDoc.getPageRef(fieldParams.pageIndex),
            'Rect': [ fieldParams.pageRect.left, fieldParams.pageRect.top, fieldParams.pageRect.right, fieldParams.pageRect.bottom ]
        };
        
        const signatureAnnotRef = this.#signDoc.registerDict(signatureAnnot);
        this.#signDoc.addPageAnnot(fieldParams.pageIndex, signatureAnnotRef);
        this.#signDoc.addFormField(signatureAnnotRef);
    }

    async addSignaturePlaceholderAsync(placeholderParams: SignatureFieldParameters & SignaturePlaceholderForFieldParameters): Promise<void> {
        this.addSignatureField(placeholderParams);
        await this.addSignaturePlaceholderForFieldAsync(placeholderParams);
    }

    getPdfBytesForThePlaceholder(): Uint8Array {
        return this.#signDoc.getPdfBytesForThePlaceholder();
    }

    async saveAsync(): Promise<Uint8Array> {
        return await this.#signDoc.saveAsync();
    }

    private async addSignaturePlaceholderForFieldAsync(placeholderParams: SignaturePlaceholderForFieldParameters): Promise<void> {
        const placeholderRef = this.addSignaturePlaceholder(placeholderParams.info, placeholderParams.placeholder);
        const updateParams: UpdateSignatureFieldParameters = {
            placeholderRef,
            hasText: false
        }
        if(placeholderParams.visual) {
            updateParams.visualRef = await this.addSignatureVisualAsync(placeholderParams.visual);
            updateParams.hasText = !!placeholderParams.visual.texts
        }
        this.updateSignatureField(placeholderParams.name, updateParams);
    }

    private addSignaturePlaceholder(signatureParams: SignatureParameters = {}, placeholderParams: PlaceholderParameters): PDFRef {
        const signatureMask = getSignatureMask(placeholderParams.signatureMaxLen);
        const offsetMask = getOffsetMask(placeholderParams.offsetMaxLen);
        const signature: any = {
            'Type': 'Sig',
            'Filter': 'Adobe.PPKLite',
            'SubFilter': 'adbe.pkcs7.detached',
            'Contents': PDFHexString.of(signatureMask),
            'ByteRange': [ 0, offsetMask, offsetMask, offsetMask ]
        };
        
        if(signatureParams.name) { 
            signature['Name'] = PDFString.of(escapeString(signatureParams.name));
        };
        if(signatureParams.location) {
            signature['Location'] = PDFString.of(escapeString(signatureParams.location));
        };
        if(signatureParams.reason) { 
            signature['Reason'] = PDFString.of(escapeString(signatureParams.reason)); 
        };
        if(signatureParams.date) { 
            signature['M'] = PDFString.fromDate(signatureParams.date); 
        };
        if(signatureParams.contactInfo) { 
            signature['ContactInfo'] = PDFString.of(escapeString(signatureParams.contactInfo)); 
        };
            
        return this.#signDoc.registerDict(signature); 
    }

    private async addSignatureVisualAsync(visualParams: SignatureVisualParametersEx): Promise<PDFRef> {
        const visual: any = {
            'FT': 'XObject',
            'Subtype': 'Form',
            'BBox': [ 0.0, 0.0, 214.0, 70.0 ], /* FIXME: 214, 70 */
            'Resources': {}
        };
        const allDrawOp: PDFOperator[] = [];

        if (visualParams.background) { 
            const backgroundRef = await this.addSignatureBackgroundAsync(visualParams.background.image, visualParams.background.imageName);
            const drawOp = this.getSignatureDrawBackgroundOperations(visualParams.background.frmName);
            allDrawOp.push(...drawOp);
            visual['Resources']['XObject'] = {
                [visualParams.background.frmName]: backgroundRef
            }
        }

        if (visualParams.texts) {
            const drawOp = this.getSignatureDrawTextOperations(visualParams.texts);
            allDrawOp.push(...drawOp);
        }
        
        return this.#signDoc.registerStream(allDrawOp, visual);
    }
    
    private async addSignatureBackgroundAsync(background: ArrayBuffer | Buffer, name: string): Promise<PDFRef> {
        const imageRef = await this.#signDoc.embedImageAsync(background);
        const drawOp: PDFOperator[] = [
            concatTransformationMatrix(1, 0, 0, 1, 0, 0),
            drawObject(name),
            popGraphicsState(),
        ];
        const visual = {
            'Type': 'XObject',
            'Subtype': 'Form',
            'BBox': [ 0.0, 0.0, 214.0, 70.0 ],/* FIXME: 214, 70 */
            'Resources': {
                'XObject': {
                    [name]: imageRef
                }
            }
        };

        return this.#signDoc.registerStream(drawOp, visual);
    }

    private getSignatureDrawTextOperations(texts: SignatureText[]): PDFOperator[] {
        const drawOp: PDFOperator[] = [
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
            moveTextSetLeadingEx(0, -1.2),
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

        return drawOp;
    }

    private getSignatureDrawBackgroundOperations(frmName: string): PDFOperator[] {
        const drawOp: PDFOperator[] = [
            pushGraphicsState(),
            concatTransformationMatrix(214, 0, 0, 70, 0, 0), /* FIXME: 214, 70 */
            drawObject(frmName),
            popGraphicsState()
        ]
        return drawOp; 
    }

    private updateSignatureField(name: string, updateParams: UpdateSignatureFieldParameters): void {
        const signature = this.#signDoc.getUnsignedField(name);
        signature.set(PDFNameEx.V, updateParams.placeholderRef);

        if(updateParams.visualRef) {
            if(!signature.has(PDFNameEx.AP)) {
                const dict = this.#signDoc.addDict({});
                signature.set(PDFNameEx.AP, dict);
            }
            signature.lookup(PDFNameEx.AP, PDFDict).set(PDFNameEx.N, updateParams.visualRef);
        } else {
            signature.delete(PDFNameEx.AP);
        }
        this.#signDoc.markObjAsChanged(signature);
    
        if(updateParams.hasText) {
            this.#signDoc.ensureSignatureFont(signature.get(PDFNameEx.P) as PDFRef);
        }
    }
}
