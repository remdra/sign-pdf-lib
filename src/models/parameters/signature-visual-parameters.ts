import { SignatureText } from '../signature-text';

export interface SignatureVisualBackgroundParameters {
    background: ArrayBuffer | Buffer; /*tested*/
    texts?: SignatureText[];
}

export interface SignatureVisualTextsParameters {
    background?: ArrayBuffer | Buffer; /*tested*/
    texts: SignatureText[];
}

export type SignatureVisualParameters = SignatureVisualBackgroundParameters | SignatureVisualTextsParameters;


export function hasTextContent(parameters: SignatureVisualParameters): boolean {
    return "texts" in parameters;
}

export function hasTextContentEx(parameters?: SignatureVisualParameters): boolean {
    return !!parameters && hasTextContent(parameters);
}


