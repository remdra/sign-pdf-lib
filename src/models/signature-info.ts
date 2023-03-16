import { Rectangle } from "./rectangle";

export interface SignatureInfo {
    pageNumber: number,
    
    name?: string,
    location?: string,
    reason?: string, 
    modified?: Date, 
    contactInfo?: string

    visual?: {
        jpgImage: Buffer;
        imageRectangle: Rectangle;
    }
};
