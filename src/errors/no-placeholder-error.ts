import { SignPdfError } from './sign-pdf-error';

export class NoPlaceholderError extends SignPdfError {
    constructor() {
        super('No placeholder.');
    }
}