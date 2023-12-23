import { Rectangle, SignatureText } from './models';
import { DigitallySignedError } from './errors';
import { computeAbsolutePageRectangle } from './helpers';

import { DocumentSnapshot, PDFArray, PDFDict, PDFDocument, PDFImage, PDFName, PDFPage, PDFRef } from 'pdf-lib';
import _ from 'lodash';

class NameProvider {

    #signatureNumber: number;

    constructor(signatureNumber: number) {
        this.#signatureNumber = signatureNumber;
    }

    getBackgroundName(): string {
        return `background${this.#signatureNumber}`;
    }
}

export interface AddVisualSignatureParameters { 
    pageIndex: number;
    rectangle: Rectangle;
    background?: Buffer; 
    texts?: SignatureText[] 
};

export class PdfDocumentVisualSigner {

    #pdfDoc: PDFDocument;
    #pdf: Buffer;
    #docSnapshot: DocumentSnapshot;
    #nameProvider: NameProvider;

    static async fromPdfAsync(pdf: Buffer): Promise<PdfDocumentVisualSigner> {
        const pdfDoc = await PDFDocument.load(pdf);

        return new PdfDocumentVisualSigner(pdfDoc, pdf);
    }

    private constructor(pdfDoc: PDFDocument, pdf: Buffer) {
        this.#pdfDoc = pdfDoc;
        this.#pdf = pdf;

        if(pdfDoc.context.pdfFileDetails.useObjectStreams) { pdfDoc.context.largestObjectNumber += 1; };
        this.#docSnapshot = pdfDoc.takeSnapshot();

        this.#nameProvider = new NameProvider(this.getSignatureCount() + 1);
    }
    
    async addVisualSignatureAsync({ pageIndex, rectangle, background, texts }: AddVisualSignatureParameters): Promise<void> {
        const signatureCount = this.getSignatureCount();
        if(signatureCount) {
            throw new DigitallySignedError();
        }

        const page = this.#pdfDoc.getPage(pageIndex);
        const pageRect = computeAbsolutePageRectangle(rectangle, page.getSize());

        const left = pageRect.left;
        const bottom = pageRect.bottom;
        const width = pageRect.right - pageRect.left;
        const height = pageRect.bottom - pageRect.top;

        const backgroundRef = background ? await this.embedImageAsync(background) : undefined;

        let drawBuffer = backgroundRef 
            ? `q 1 0 0 1 ${left} ${bottom} cm 1 0 0 1 0 0 cm ${width} 0 0 -${height} 0 0 cm 1 0 0 1 0 0 cm /${this.#nameProvider.getBackgroundName()} Do Q`
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
    
        const visual = this.#pdfDoc.context.stream(drawBuffer, {});
        const visualRef = this.#pdfDoc.context.register(visual);

        this.ensurePageContentsArray(page);
        this.#docSnapshot.markRefForSave(page.ref);
        const pageContents = page.node.lookup(PDFName.of('Contents'), PDFArray);
        pageContents.push(visualRef);
        if(backgroundRef) {
            page.node.lookup(PDFName.of('Resources'), PDFDict).set(PDFName.of('XObject'), this.#pdfDoc.context.obj({ ['background1']: backgroundRef }));
        }

        if(texts) {
            this.embedSignatureFont(page.node);
        }
        if(page.node.get(PDFName.of('Resources')) instanceof PDFRef) {
            this.#docSnapshot.markRefForSave(page.node.get(PDFName.of('Resources')) as PDFRef);
        } else {
            this.#docSnapshot.markRefForSave(page.ref);
        }
    }

    async saveAsync(): Promise<Buffer> {
        const incrementalPdf = Buffer.from(await this.#pdfDoc.saveIncremental(this.#docSnapshot));

        return Buffer.concat([
            this.#pdf,
            incrementalPdf
        ]);
    }

    private ensurePageContentsArray(page: PDFPage): void {
        const pageContents = page.node.get(PDFName.of('Contents'));
        if(pageContents instanceof PDFArray) {
            return;
        }
        const newPageContents = this.#pdfDoc.context.obj([ pageContents ]);
        page.node.set(PDFName.of('Contents'), newPageContents);
        this.#docSnapshot.markRefForSave(page.ref);
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
