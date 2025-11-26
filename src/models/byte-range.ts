export interface ByteRange {//////////////
    start: number;
    length: number;
};

export interface PdfByteRanges {  /*FIXME: rename SignatureRanges*/
    before: ByteRange;
    signature: ByteRange;
    after: ByteRange;
};

export interface Interval { //FIXME: move to file
    start: number;
    length: number;
};
