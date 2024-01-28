import { PdfVerifySignaturesResult, VerifySignatureResult } from '../../src/models';
import { SignatureParameters } from '../../src/models/parameters';

export function transformPdfCheckResult(check: any): PdfVerifySignaturesResult {
    return {
        ...check,
        signatures: check.signatures.map((signature: any) => transformSignatureCheckResult(signature))
    }
}

function transformSignatureCheckResult(check: any): VerifySignatureResult {
    if(!check.details) {
        return check;
    }
    
    return {
        ...check,
        details: transformSignatureDetails(check.details)
    }
}

function transformSignatureDetails(details: any): SignatureParameters {

    details = { ...details };
    if(details.date) {
        details.date = new Date(Date.parse(details.date));
    }

    return details;
}
