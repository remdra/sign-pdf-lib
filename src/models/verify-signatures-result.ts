import { SignatureParameters as SignatureParameters } from './parameters/signature-parameters';

export interface SignatureVerifySignatureResult {
    name: string;
    integrity: boolean;
    details: SignatureParameters;
}

export interface FieldVerifySignatureResult {
    name: string;
    isField: boolean;
}

export type VerifySignatureResult = SignatureVerifySignatureResult | FieldVerifySignatureResult;

export interface PdfVerifySignaturesResult {
    integrity: boolean;
    signatures: VerifySignatureResult[];
}
