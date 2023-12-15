export interface ByteRange {
    start: number;
    length: number;
};

export interface PdfByteRanges { 
    before: ByteRange;
    signature: ByteRange;
    after: ByteRange;
};
