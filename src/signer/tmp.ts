import { mergeUint8Arrays, PDFContext, PDFDocument } from "pdf-lib";
import { indexOf, toArrayBuffer } from "../helpers";
import { PdfByteRanges } from "../models";

export function getSignatureRange(pdf: Buffer | Uint8Array) {
    let contentsStartIndex = 0;
    while(pdf[contentsStartIndex] != '<'.charCodeAt(0)) {
        contentsStartIndex = indexOf(pdf, '/Contents', contentsStartIndex) + '/Contents'.length;
        while(pdf[contentsStartIndex] == ' '.charCodeAt(0)) {
            contentsStartIndex++;
        }
    }
    const start = indexOf(pdf, '<', contentsStartIndex) + 1;
    const end = indexOf(pdf, '>', start);

    return {
        start,
        end
    };
}

export function getPdfSigningRanges(initialPdfLength: number, incrementalPdf: Buffer | Uint8Array): PdfByteRanges {
    const { start: startSignature, end: endSignature } = getSignatureRange(incrementalPdf);

    return {
        before: {
            start: 0,
            length: initialPdfLength + startSignature - 1
        },
        signature: {
            start: initialPdfLength + startSignature - 1,
            length: endSignature - startSignature + 2
        },
        after: {
            start: initialPdfLength + endSignature + 1,
            length: incrementalPdf.length - endSignature - 1
        }
    };
}

export function updateByteRange(incrementalPdf: Buffer | Uint8Array, initialPdfLength: number): Uint8Array {
    const byteRangeStartIndex = indexOf(incrementalPdf, '/ByteRange');
    if(byteRangeStartIndex < 0) {
        return incrementalPdf;
    }

    const { before, after } = getPdfSigningRanges(initialPdfLength, incrementalPdf);

    const byteRangeArray = PDFContext.create().obj([ before.start, before.length, after.start, after.length ]);
    const startOfByteRange = indexOf(incrementalPdf, '[', byteRangeStartIndex);
    const endOfByteRange = indexOf(incrementalPdf, ']', startOfByteRange) + 1;
    if(endOfByteRange - startOfByteRange < byteRangeArray.sizeInBytes()) {
        throw new Error('Not enough space to store range.');
    }
    const byteRangeBufferArray= new Uint8Array(endOfByteRange - startOfByteRange).fill(' '.charCodeAt(0));
    byteRangeArray.copyBytesInto(byteRangeBufferArray, 0);

    incrementalPdf.set(byteRangeBufferArray, startOfByteRange);
    return incrementalPdf;
//    return mergeUint8Arrays([ 
//        incrementalPdf.subarray(0, startOfByteRange),
//        byteRangeBufferArray,
//        incrementalPdf.subarray(endOfByteRange)
//    ]);
}

export function getSignBuffer(pdf: Uint8Array, signRanges: PdfByteRanges): Uint8Array {//////////////////
    return mergeUint8Arrays([
        pdf.subarray(signRanges.before.start, signRanges.before.start + signRanges.before.length), 
        pdf.subarray(signRanges.after.start, signRanges.after.start + signRanges.after.length)
    ]);
}

export async function loadPdfDocumentAsync(pdf: ArrayBuffer | Buffer | Uint8Array): Promise<PDFDocument> {
    return await PDFDocument.load(toArrayBuffer(pdf));
}
