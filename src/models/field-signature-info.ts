import { Rectangle } from "./rectangle";

export interface FieldSignatureInfo {
    fieldName: string;
    
    name?: string;
    location?: string;
    reason?: string;
    modified?: Date; 
    contactInfo?: string;

    image: Buffer;
};
