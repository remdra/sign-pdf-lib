import { SignPdfError } from './sign-pdf-error';

export class SignatureNotFoundError extends SignPdfError {
    constructor(name: string) {
        super(`Signature '${name}' not found.`);
    }
}