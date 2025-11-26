import { SignPdfError } from './sign-pdf-error';

export class NotSignedError extends SignPdfError {
    constructor(name: string) {
        super(`Signature '${name}' not signed.`);
    }
}