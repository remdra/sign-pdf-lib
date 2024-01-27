import { Rectangle } from '../rectangle';
import { SignatureText } from '../signature-text';

interface SignVisualBackgroundParameters {
    pageNumber: number;
    rectangle: Rectangle;
    
    background: Buffer;
    texts?: SignatureText[];
};

interface SignVisualTextsParameters {
    pageNumber: number;
    rectangle: Rectangle;
    
    background?: Buffer;
    texts: SignatureText[];
};

export type SignVisualParameters = SignVisualBackgroundParameters | SignVisualTextsParameters;
