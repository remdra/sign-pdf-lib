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


interface SignatureBackgroundParametersEx {
    background: {
        image: ArrayBuffer | Buffer;
        imageName: string;
        frmName: string;
    };
    texts?: SignatureText[];
}

export interface SignatureTextsParametersEx {
    background?: {
        image: ArrayBuffer | Buffer;
        imageName: string;
        frmName: string;
    };
    texts: SignatureText[];
}

export type SignatureVisualParametersEx = SignatureBackgroundParametersEx | SignatureTextsParametersEx;


export function hasTextContent(params: SignatureVisualParameters): params is SignatureTextsParameters { /*FIXME: remove it */
    return "texts" in params;
}

export function hasTextContentEx(params?: SignatureVisualParameters): params is SignatureTextsParameters { /*FIXME: remove it */
    return !!params && hasTextContent(params);
}

export function hasBackgroundContent(params: SignatureVisualParameters): params is SignatureBackgroundParameters { /*FIXME: remove it */
    return "background" in params;
}


