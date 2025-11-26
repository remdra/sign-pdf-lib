import { SignPdfError } from './sign-pdf-error';

export class NoSignatureError extends SignPdfError {
    constructor(name: string) {
        super(`Signature '${name}' not found.`);
    }
}