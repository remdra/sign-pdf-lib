import { SignatureText } from '../signature-text';

export interface SignatureBackgroundParameters {
    background: ArrayBuffer | Buffer;
    texts?: SignatureText[];
}

export interface SignatureTextsParameters {
    background?: ArrayBuffer | Buffer;
    texts: SignatureText[];
}

export type SignatureVisualParameters = SignatureBackgroundParameters | SignatureTextsParameters;


export function hasTextContent(params: SignatureVisualParameters): params is SignatureTextsParameters {
    return "texts" in params;
}

export function hasTextContentEx(params?: SignatureVisualParameters): params is SignatureTextsParameters { /*FIXME: remove it */
    return !!params && hasTextContent(params);
}

export function hasBackgroundContent(params: SignatureVisualParameters): params is SignatureBackgroundParameters {
    return "background" in params;
}


