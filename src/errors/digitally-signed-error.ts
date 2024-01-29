import { SignPdfError } from './sign-pdf-error';

export class DigitallySignedError extends SignPdfError {
    constructor() {
        super('Digital signature found.');
    }
}