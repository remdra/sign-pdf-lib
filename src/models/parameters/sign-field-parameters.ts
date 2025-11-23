import { SignatureParameters } from './signature-parameters';
import { SignatureVisualParameters } from './signature-visual-parameters';

export interface SignFieldParameters {/*testing*/ //check for signature and visual not present
    fieldName: string;
    signature?: SignatureParameters;
    visual?: SignatureVisualParameters;
};
