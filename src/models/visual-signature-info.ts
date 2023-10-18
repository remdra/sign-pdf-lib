import { Rectangle } from "./rectangle";

export interface VisualSignatureInfo {
    pageNumber: number,
    
    image: Buffer;
    imageRectangle: Rectangle;
};
