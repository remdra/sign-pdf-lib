export interface SignatureDetails {
    name?: string;
    reason?: string;
    location?: string;
    contactInfo?: string;
    date?: Date;
}

export interface SignatureCheckResult {
    name: string;
    integrity: boolean;
    details: SignatureDetails;
}

export interface PdfCheckResult {
    integrity: boolean;
    signatures: SignatureCheckResult[];
}
