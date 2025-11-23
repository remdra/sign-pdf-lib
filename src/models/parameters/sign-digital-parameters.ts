import { Rectangle } from '../rectangle';
import { SignatureText } from '../signature-text';
import { SignatureParameters } from './signature-parameters';


export interface SignDigitalVisualBackgroundParameters {
    rectangle: Rectangle;
    background: ArrayBuffer | Buffer; /*tested*///use existing
    texts?: SignatureText[];
};

export interface SignDigitalVisualTextsParameters {
    rectangle: Rectangle;
    background?: ArrayBuffer | Buffer; /*tested*/
    texts: SignatureText[];
};

export type SignDigitalVisualParameters = SignDigitalVisualBackgroundParameters | SignDigitalVisualTextsParameters;

export interface SignDigitalParameters {
    pageNumber: number;
    name?: string;
    signature?: SignatureParameters;
    visual?: SignDigitalVisualParameters;
};
