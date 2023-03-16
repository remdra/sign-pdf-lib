export interface ByteRange {
    start: number;
    length: number;
};

export interface PdfByteRanges { 
    rangeBefore: ByteRange;
    signature: ByteRange;
    rangeAfter: ByteRange;
};
