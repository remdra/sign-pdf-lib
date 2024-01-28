import { PdfSigningDocument } from './pdf-signing-document';
import { Rectangle, SignatureText } from '../models';
import { DigitallySignedError } from '../errors';
import { computeAbsolutePageReverseRectangle } from '../helpers';
import { addRandomSuffix } from 'pdf-lib';

export interface AddVisualSignatureBackgroundParameters { 
    pageIndex: number;
    rectangle: Rectangle;
    background: Buffer; 
    texts?: SignatureText[];

    reverseY?: boolean;

    backgroundName?: string;
};

export interface AddVisualSignatureTextsParameters { 
    pageIndex: number;
    rectangle: Rectangle;
    background?: Buffer; 
    texts: SignatureText[];

    reverseY?: boolean;
    
    backgroundName?: string;
};

export type AddVisualSignatureParameters = AddVisualSignatureBackgroundParameters | AddVisualSignatureTextsParameters;

export class PdfDocumentVisualSigner {

    #signingDoc: PdfSigningDocument;

    static async fromPdfAsync(pdf: Buffer): Promise<PdfDocumentVisualSigner> {
        const signingDoc = await PdfSigningDocument.fromPdfAsync(pdf);

        return new PdfDocumentVisualSigner(signingDoc);
    }

    private constructor(signingDoc: PdfSigningDocument) {
        this.#signingDoc = signingDoc;
    }
    
    async addVisualSignatureAsync({ pageIndex, rectangle, texts, background, backgroundName, reverseY }: AddVisualSignatureParameters): Promise<void> {
        if(!texts && !background) {
            return;
        }
        
        const signatureCount = this.#signingDoc.getSignatureCount();
        if(signatureCount) {
            throw new DigitallySignedError();
        }

        backgroundName = backgroundName || addRandomSuffix('SignatureBackground')

        const pageSize = this.#signingDoc.getPageSize(pageIndex);
        const pageRect = computeAbsolutePageReverseRectangle(rectangle, pageSize);

        const left = pageRect.left;
        const bottom = pageRect.bottom;
        const width = pageRect.right - pageRect.left;
        const height = pageRect.bottom - pageRect.top;
        const backgroundRef = background ? await this.#signingDoc.embedImageAsync(background) : undefined;

        let drawBuffer = '';
        if(backgroundRef) {
            drawBuffer = 
                'q'
                + (reverseY ? ` 1 0 0 -1 0 ${pageSize.height} cm` : '')
                + ` 1 0 0 -1 ${left} ${bottom} cm` 
                + ' 1 0 0 1 0 0 cm' 
                + ` ${width} 0 0 ${height} 0 0 cm` 
                + ' 1 0 0 1 0 0 cm' 
                + ` /${backgroundName} Do` + ' Q'
        }
        if(texts) {
            drawBuffer = drawBuffer
                + ' q'
                + (reverseY ? ` 1 0 0 -1 0 ${pageSize.height} cm` : '')
                + ' 0 0 106 68 re'
                + ` 1 0 0 1 ${left} ${bottom} cm`
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
    
        const visualRef = this.#signingDoc.registerStream(drawBuffer, {});
        this.#signingDoc.addPageContent(visualRef, pageIndex);
        if(backgroundRef) {
            this.#signingDoc.addPageResource(backgroundRef, pageIndex, backgroundName);
        }

        if(texts) {
            this.#signingDoc.embedSignatureFont(pageIndex);
        }
    }

    async saveAsync(): Promise<Buffer> {
        return await this.#signingDoc.saveAsync();
    }
}
