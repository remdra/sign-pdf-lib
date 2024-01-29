import { SignatureText } from '../signature-text';
import { SignatureParameters } from './signature-parameters';

export interface SignFieldParameters {
    fieldName: string;
    signature?: SignatureParameters;
    visual?: {
        background?: Buffer;
        texts?: SignatureText[];
    }
};
