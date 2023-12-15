import { SigningPdfDocument } from './signing-pdf-document';
import { PdfByteRanges } from './models';
import { TooSmallPlaceholderError } from './errors';

export class SignatureEmbeder {

    #pdf: Buffer;
    #signRanges: PdfByteRanges;

    static async fromPdfAsync(pdf: Buffer): Promise<SignatureEmbeder> {
        const pdfSigningDoc = await SigningPdfDocument.fromPdfAsync(pdf);

        return new SignatureEmbeder(pdfSigningDoc, pdf);
    }

    private constructor(pdfSigningDoc: SigningPdfDocument, pdf: Buffer) {
        this.#pdf = pdf;
        this.#signRanges = pdfSigningDoc.getPlaceholderRanges();
    }

    getSignBuffer(): Buffer {
        return Buffer.concat([
            this.#pdf.subarray(this.#signRanges.before.start, this.#signRanges.before.start + this.#signRanges.before.length), 
            this.#pdf.subarray(this.#signRanges.after.start, this.#signRanges.after.start + this.#signRanges.after.length)
        ]);
    }
    
    embedSignature(signature: Buffer): Buffer {
        const hexSignature = signature.toString('hex').toUpperCase();
    
        return this.embedHexSignature(hexSignature);
    }
    
    embedHexSignature(hexSignature: string): Buffer {
        const signatureLen = this.#signRanges.signature.length - 2;
        if(signatureLen < hexSignature.length) {
            throw new TooSmallPlaceholderError();
        }
        const diff = signatureLen - hexSignature.length;
        const fullSignature = Buffer.concat([Buffer.from(hexSignature), Buffer.from('0'.repeat(diff))]);
    
        return Buffer.concat([
            this.#pdf.subarray(this.#signRanges.before.start, this.#signRanges.before.start + this.#signRanges.before.length + 1), 
            fullSignature, 
            this.#pdf.subarray(this.#signRanges.after.start - 1)
        ]);
    }
}
