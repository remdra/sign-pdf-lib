import { SignPdfError } from './sign-pdf-error';

export class NoSignatureFieldError extends SignPdfError {
    constructor(name: string) {
        super(`Signature field '${name}' not found.`);
    }
}