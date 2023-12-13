import { SignatureParameters as SignatureParameters } from "./parameters/signature-parameters";

export interface VerifySignatureResult {
    name: string;
    integrity: boolean;
    details: SignatureParameters;
}

export interface PdfVerifySignaturesResult {
    integrity: boolean;
    signatures: VerifySignatureResult[];
}
