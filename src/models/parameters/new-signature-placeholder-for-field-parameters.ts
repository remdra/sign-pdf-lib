import { PlaceholderParameters } from "./placeholder-parameters";
import { SignatureParameters } from "./signature-parameters";
import { SignatureVisualParametersEx } from "./signature-visual-parameters";

export interface SignaturePlaceholderForFieldParameters {
    name: string;
    info?: SignatureParameters;
    visual?: SignatureVisualParametersEx;
    placeholder: PlaceholderParameters;
}

