export interface ByteRange {
    start: number;
    length: number;
};

export interface PdfByteRanges {  /*FIXME: rename SignatureRanges*/
    before: ByteRange;
    signature: ByteRange;
    after: ByteRange;
};
