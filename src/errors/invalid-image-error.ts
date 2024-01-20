import { SignPdfError } from './sign-pdf-error';

export class InvalidImageError extends SignPdfError {
    constructor() {
        super(`Invalid image.`);
    }
}