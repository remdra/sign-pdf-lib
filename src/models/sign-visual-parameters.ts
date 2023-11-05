import { Rectangle } from "./rectangle";

export interface SignVisualParameters {
    pageNumber: number;
    
    background: Buffer;
    boundingBox: Rectangle;
};
