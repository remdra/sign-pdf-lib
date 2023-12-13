import { Rectangle } from "../rectangle";
import { SignatureText } from "../signature-text";
import { SignatureParameters } from "./signature-parameters";

export interface SignDigitalVisualCommonParameters {
    rectangle: Rectangle;
};

export interface SignDigitalVisualBackgroundParameters extends SignDigitalVisualCommonParameters {
    background: Buffer;
};

export interface SignDigitalVisualTextsParameters extends SignDigitalVisualCommonParameters {
    texts: SignatureText[];
};

export type SignDigitalVisualParameters = SignDigitalVisualBackgroundParameters | SignDigitalVisualTextsParameters | (SignDigitalVisualBackgroundParameters & SignDigitalVisualTextsParameters );

export interface SignDigitalParameters {
    pageNumber: number;
    signature?: SignatureParameters;
    visual?: SignDigitalVisualParameters;
};
