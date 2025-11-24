import { SignDocumentBasic } from './new-sign-document-basic';
import { Rectangle, SignatureText } from '../models';
import { PlaceholderMaskParameters, PlaceholderParameters, SignatureParameters } from '../models/parameters';
import { escapeString } from '../helpers';
import { PDFNameEx } from '../hacks';

import { beginText, concatTransformationMatrix, drawObject, endText, nextLine, PDFDict, PDFHexString, PDFName, PDFNumber, PDFOperator, PDFOperatorNames, PDFRef, PDFString, popGraphicsState, pushGraphicsState, rectangle, setCharacterSpacing, setCharacterSqueeze, setFontAndSize, setTextMatrix, setTextRenderingMode, setTextRise, setWordSpacing, showText, TextRenderingMode } from 'pdf-lib';


export interface SignatureFieldParameters { 
    name: string;
    pageIndex: number;
    pageRect: Rectangle;
};

export type SignaturePlaceholderParameters = SignatureFieldParameters & SignaturePlaceholderForFieldParameters;

interface SignaturePlaceholderForFieldParametersEx {
    name: string;
    info?: SignatureParameters;
    visual?: SignatureVisualParametersEx;
    placeholder: PlaceholderMaskParameters;
}

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

interface UpdateSignatureFieldParameters { 
    placeholderRef: PDFRef;
    visualRef?: PDFRef;
    hasText: boolean;
};

function getMaskParameters(placeholderParams: PlaceholderParameters): PlaceholderMaskParameters {
    const maskParam: PlaceholderMaskParameters = {
        signatureMask: 'A'.repeat(placeholderParams.signatureMaxLen),
        offsetMask: +'9'.repeat(placeholderParams.offsetMaxLen)
    }

    return maskParam;
}

function getPlaceholderForFieldMaskParameters(placeholderParams: SignaturePlaceholderForFieldParameters): SignaturePlaceholderForFieldParametersEx {
    const maskParam = getMaskParameters(placeholderParams.placeholder);

    const placeholderMaskParams: SignaturePlaceholderForFieldParametersEx = {
        ...placeholderParams,
        placeholder: maskParam
    }

    return placeholderMaskParams;
}


export type SignatureVisualParametersEx = SignatureBackgroundParametersEx | SignatureTextsParametersEx;

export class SignDocument {

    #signDoc: SignDocumentBasic;

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
        const placeholderMaskParams = getPlaceholderForFieldMaskParameters(placeholderParams);
        await this.addSignaturePlaceholderForFieldAsync(placeholderMaskParams);
    }

    async saveAsync(): Promise<Uint8Array> {
        return await this.#signDoc.saveAsync();
    }

    private async addSignaturePlaceholderForFieldAsync(placeholderParams: SignaturePlaceholderForFieldParametersEx): Promise<void> {
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

    private addSignaturePlaceholder(signatureParams: SignatureParameters = {}, placeholderParams: PlaceholderMaskParameters): PDFRef {
        const signature: any = {
            'Type': 'Sig',
            'Filter': 'Adobe.PPKLite',
            'SubFilter': 'adbe.pkcs7.detached',
            'Contents': PDFHexString.of(placeholderParams.signatureMask),
            'ByteRange': [ 0, placeholderParams.offsetMask, placeholderParams.offsetMask, placeholderParams.offsetMask ]
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
        let drawBuffer = '';

        if (visualParams.background) { 
            const backgroundRef = await this.addSignatureBackgroundAsync(visualParams.background.image, visualParams.background.imageName);
            drawBuffer += this.getSignatureDrawBackgroundOperations(visualParams.background.frmName);
            visual['Resources']['XObject'] = {
                [visualParams.background.frmName]: backgroundRef
            }
        }

        if (visualParams.texts) {
            drawBuffer += this.getSignatureDrawTextOperations(visualParams.texts);
        }
        
        return this.#signDoc.registerStream(drawBuffer, visual);
    }
    
    private async addSignatureBackgroundAsync(background: ArrayBuffer | Buffer, name: string): Promise<PDFRef> {
        const imageRef = await this.#signDoc.embedImageAsync(background);
        const drawStream = `q 1 0 0 1 0 0 cm /${name} Do Q`; /* FIXME: use operators */
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

        return this.#signDoc.registerStream(drawStream, visual);
    }

    private getSignatureDrawTextOperations(texts: SignatureText[]): string {
        return ' q'  /* FIXME: use operators */
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

    private getSignatureDrawBackgroundOperations(frmName: string): string {
        return `q 214 0 0 70 0 0 cm /${frmName} Do Q`; /* FIXME: 214, 70 */
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
