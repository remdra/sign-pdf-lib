import { SignatureText } from "./signature-text";

export interface SignFieldParameters {
    fieldName: string;
    
    name?: string;
    location?: string;
    reason?: string;
    date?: Date; 
    contactInfo?: string;

    background: Buffer;
    texts: SignatureText[];
};
