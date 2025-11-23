import { SignDocumentBasic } from './new-sign-document-basic';
import { PdfByteRanges, Rectangle, SignatureText } from '../models';
import { hasTextContentEx, PlaceholderParameters, SignatureParameters, SignatureVisualParameters } from '../models/parameters';
import { computeAbsolutePageReverseRectangle, escapeString } from '../helpers';
import { AlreadySignedError } from '../errors';

import { beginText, concatTransformationMatrix, drawObject, endText, nextLine, PDFDict, PDFHexString, PDFName, PDFNumber, PDFOperator, PDFOperatorNames, PDFRef, PDFString, popGraphicsState, pushGraphicsState, rectangle, setCharacterSpacing, setCharacterSqueeze, setFontAndSize, setTextMatrix, setTextRenderingMode, setTextRise, setWordSpacing, showText, TextRenderingMode } from 'pdf-lib';


export interface AddSignatureFieldParameters { 
    name: string;
    pageIndex: number;
    pageRect: Rectangle;
};

export class SignDocument {

    #signDoc: SignDocumentBasic;

    static async fromPdfAsync(pdf: ArrayBuffer | Buffer | Uint8Array): Promise<SignDocument> {
        const signingDoc = await SignDocumentBasic.fromPdfAsync(pdf);

        return new SignDocument(signingDoc);
    }

    private constructor(signDoc: SignDocumentBasic) {
        this.#signDoc = signDoc;
    }

    addSignatureField({ name, pageIndex, pageRect }: AddSignatureFieldParameters): void {
        this.#signDoc.ensureAcroForm();
        this.#signDoc.ensurePageAnnots(pageIndex);

        const signature: any = {
            'FT': 'Sig',
            'Type': 'Annot',
            'Subtype': 'Widget',
            'T': PDFString.of(name),
            'F': 132,
            'P': this.#signDoc.getPageRef(pageIndex),
            'Rect': [ pageRect.left, pageRect.top, pageRect.right, pageRect.bottom ]
        };
        
        const annotRef = this.#signDoc.registerDict(signature);
        this.#signDoc.addPageAnnot(pageIndex, annotRef);
        this.#signDoc.addFormField(annotRef);
    }

    async saveAsync(): Promise<Uint8Array> {
        return await this.#signDoc.saveAsync();
    }
}
