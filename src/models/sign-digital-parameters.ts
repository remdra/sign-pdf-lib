import { Rectangle } from "./rectangle";
import { SignatureText } from "./signature-text";

export interface SignDigitalParameters {
    pageNumber: number;
    
    name?: string;
    location?: string;
    reason?: string;
    date?: Date; 
    contactInfo?: string;

    visual?: {
        rectangle: Rectangle;
        background: Buffer;
    } | {
        rectangle: Rectangle;
        texts: SignatureText[];
    } | {
        rectangle: Rectangle;
        background: Buffer;
        texts: SignatureText[];
    }
};
