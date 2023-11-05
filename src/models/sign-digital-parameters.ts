import { Rectangle } from "./rectangle";

export interface SignDigitalParameters {
    pageNumber: number;
    
    name?: string;
    location?: string;
    reason?: string;
    date?: Date; 
    contactInfo?: string;

    visual?: {
        background: Buffer;
        boundingBox: Rectangle;
    }
};
