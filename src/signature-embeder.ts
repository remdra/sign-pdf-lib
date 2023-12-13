import { PDFDocument } from "pdf-lib";
import { SigningPdfDocument } from "./signing-pdf-document";
import { PdfByteRanges } from "./models";

export class SignatureEmbeder {

    #pdfSigningDoc: SigningPdfDocument;
    #pdf: Buffer;
    #signRanges: PdfByteRanges;

    static async loadAsync(pdf: Buffer): Promise<SignatureEmbeder> {
        const pdfSigningDoc = await SigningPdfDocument.loadAsync(pdf);

        return new SignatureEmbeder(pdfSigningDoc, pdf);
    }

    private constructor(pdfSigningDoc: SigningPdfDocument, pdf: Buffer) {
        this.#pdfSigningDoc = pdfSigningDoc;
        this.#pdf = pdf;
        this.#signRanges = this.#pdfSigningDoc.getPlaceholderRanges();
    }

    getSignBuffer(): Buffer {
        return Buffer.concat([
            this.#pdf.subarray(this.#signRanges.before.start, this.#signRanges.before.start + this.#signRanges.before.length), 
            this.#pdf.subarray(this.#signRanges.rangeAfter.start, this.#signRanges.rangeAfter.start + this.#signRanges.rangeAfter.length)
        ]);
    }
    
    embedSignature(signature: Buffer): Buffer {
        const hexSignature = signature.toString('hex').toUpperCase();
    
        return this.embedHexSignature(hexSignature);
    }
    
    private embedHexSignature(hexSignature: string): Buffer {
        const signatureLen = this.#signRanges.signature.length;
        if(signatureLen < hexSignature.length) {
            throw new Error('Not enough space to store signature.');
        }
        const diff = signatureLen - hexSignature.length - 2;
        const fullSignature = Buffer.concat([Buffer.from(hexSignature), Buffer.from('0'.repeat(diff))]);
    
        return Buffer.concat([
            this.#pdf.subarray(this.#signRanges.before.start, this.#signRanges.before.start + this.#signRanges.before.length + 1), 
            fullSignature, 
            this.#pdf.subarray(this.#signRanges.rangeAfter.start - 1)
        ]);
    }
}
