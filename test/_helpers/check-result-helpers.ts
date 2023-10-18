import { PdfCheckResult, SignatureCheckResult, SignatureDetails } from "src/models/check-result"

export function transformPdfCheckResult(check: any): PdfCheckResult {
    return {
        ...check,
        signatures: check.signatures.map((signature: any) => transformSignatureCheckResult(signature))
    }
}

function transformSignatureCheckResult(check: any): SignatureCheckResult {
    return {
        ...check,
        details: transformSignatureDetails(check.details)
    }
}

function transformSignatureDetails(details: any): SignatureDetails {

    details = { ...details };
    if(details.date) {
        details.date = new Date(Date.parse(details.date));
    }

    return details;
}
