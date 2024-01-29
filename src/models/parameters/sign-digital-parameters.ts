import { Rectangle } from '../rectangle';
import { SignatureText } from '../signature-text';
import { SignatureParameters } from './signature-parameters';


export interface SignDigitalVisualBackgroundParameters {
    rectangle: Rectangle;
    background: Buffer;
    texts?: SignatureText[];
};

export interface SignDigitalVisualTextsParameters {
    rectangle: Rectangle;
    background?: Buffer;
    texts: SignatureText[];
};

export type SignDigitalVisualParameters = SignDigitalVisualBackgroundParameters | SignDigitalVisualTextsParameters;

export interface SignDigitalParameters {
    pageNumber: number;
    name?: string;
    signature?: SignatureParameters;
    visual?: SignDigitalVisualParameters;
};
