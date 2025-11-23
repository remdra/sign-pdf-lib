import { PdfDocumentDigitalSigner } from './pdf-document-digital-signer';
import { PdfByteRanges } from '../models';
import { TooSmallPlaceholderError } from '../errors';
import { toUint8Array } from '../helpers';

import { mergeIntoTypedArray, mergeUint8Arrays } from 'pdf-lib';

export class SignatureEmbeder {

    #pdf: Uint8Array;
    #signRanges: PdfByteRanges;

    static async fromPdfAsync(pdf: ArrayBuffer | Buffer | Uint8Array): Promise<SignatureEmbeder> {/*testing*/
        const pdfDocSigner = await PdfDocumentDigitalSigner.fromPdfAsync(pdf);
        const signRanges = pdfDocSigner.getPlaceholderRanges();

        return new SignatureEmbeder(signRanges, pdf);
    }

    private constructor(signRanges: PdfByteRanges, pdf: ArrayBuffer | Buffer | Uint8Array) {/*tested*/
        this.#pdf = toUint8Array(pdf);
        this.#signRanges = signRanges;
    }

    getSignBuffer(): Uint8Array {
        return mergeUint8Arrays([
            this.#pdf.subarray(this.#signRanges.before.start, this.#signRanges.before.start + this.#signRanges.before.length),
            this.#pdf.subarray(this.#signRanges.after.start, this.#signRanges.after.start + this.#signRanges.after.length)
        ]);
    }
    
    embedSignature(signature: ArrayBuffer | Buffer | Uint8Array): Uint8Array {/*testing*/
        const hexSignature = signature.toString('hex').toUpperCase();
    
        return this.embedHexSignature(hexSignature);
    }
    
    embedHexSignature(hexSignature: string): Uint8Array {
        const signatureLen = this.#signRanges.signature.length - 2;
        if(signatureLen < hexSignature.length) {
            throw new TooSmallPlaceholderError();
        }
        const diff = signatureLen - hexSignature.length;
        const fullSignature = mergeIntoTypedArray(hexSignature, '0'.repeat(diff));
    
        return mergeUint8Arrays([
            this.#pdf.subarray(this.#signRanges.before.start, this.#signRanges.before.start + this.#signRanges.before.length + 1), 
            fullSignature, 
            this.#pdf.subarray(this.#signRanges.after.start - 1)
        ]);
    }
}
