import { SignPdfError } from './sign-pdf-error';

export class TooSmallPlaceholderError extends SignPdfError {
    constructor() {
        super('Not enough space to store signature.');
    }
}