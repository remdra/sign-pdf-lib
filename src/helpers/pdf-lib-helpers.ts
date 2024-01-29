import { SignatureParameters } from "../models/parameters";
import { NoPlaceholderError } from "../errors";

import { PDFArray, PDFDict, PDFName, PDFNumber, PDFString } from "pdf-lib";
import { PdfByteRanges } from "src/models";

export function getSignatureDetails(signature: PDFDict): SignatureParameters {
    const details: SignatureParameters = {};
    
    const name = getStringMaybe(signature, 'Name');
    if(name) details.name = name;
    const reason = getStringMaybe(signature, 'Reason');
    if(reason) details.reason = reason;
    const location = getStringMaybe(signature, 'Location');
    if(location) details.location = location;
    const date = getDateMaybe(signature, 'M');
    if(date) details.date = date;

    return details;
}

export function getSignatureName(signature: PDFDict): string {
    const value = signature.lookup(PDFName.of('T'), PDFString);

    return value.asString();
}    

export function getPdfRangesFromSignature(signature: PDFDict): PdfByteRanges {
    if(!signature.get(PDFName.of('V'))) {
        throw new NoPlaceholderError();
    }

    const signatureV = signature.lookup(PDFName.of('V'), PDFDict);
    const byteRange = signatureV.lookup(PDFName.of('ByteRange'), PDFArray);

    const start1 = (byteRange.get(0) as PDFNumber).asNumber();
    const length1 = (byteRange.get(1) as PDFNumber).asNumber();
    const start2 = (byteRange.get(2) as PDFNumber).asNumber();
    const length2 = (byteRange.get(3) as PDFNumber).asNumber();


    return {
        before: {
            start: start1,
            length: length1
        },
        signature: {
            start: start1 + length1,
            length: start2 - (start1 + length1)
        },
        after: {
            start: start2,
            length: length2
        }
    };
}


function getStringMaybe(dict: PDFDict, key: string): string | undefined {
    const value = dict.lookupMaybe(PDFName.of(key), PDFString);

    return value?.asString();
}

function getDateMaybe(dict: PDFDict, key: string): Date | undefined {
    const value = dict.lookupMaybe(PDFName.of(key), PDFString);

    return value?.decodeDate();
}
