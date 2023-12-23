import { Rectangle } from '../rectangle';
import { SignatureText } from '../signature-text';

export interface SignVisualParameters {
    pageNumber: number;
    
    background: Buffer;
    texts?: SignatureText[];
    rectangle: Rectangle;
};
