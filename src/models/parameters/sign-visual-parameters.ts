import { Rectangle } from '../rectangle';
import { SignatureText } from '../signature-text';

interface SignVisualBackgroundParameters {
    pageNumber: number;
    rectangle: Rectangle;

    reverseY?: boolean;
    
    background: ArrayBuffer | Buffer; /*tested*/ ////////////use existing
    texts?: SignatureText[];
};

interface SignVisualTextsParameters {
    pageNumber: number;
    rectangle: Rectangle;
    
    reverseY?: boolean;

    background?: ArrayBuffer | Buffer; /*tested*/
    texts: SignatureText[];
};

export type SignVisualParameters = SignVisualBackgroundParameters | SignVisualTextsParameters;
