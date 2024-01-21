import { SignPdfError } from './sign-pdf-error';

export class AlreadySignedError extends SignPdfError {
    constructor(name: string) {
        super(`Signature '${name}' already signed.`);
    }
}