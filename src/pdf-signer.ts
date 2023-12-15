import { DocumentSnapshot, PDFArray, PDFContext, PDFDict, PDFDocument, PDFHexString, PDFImage, PDFName, PDFNumber, PDFRef, PDFString } from 'pdf-lib';
import * as _ from 'lodash';
import * as forge from 'node-forge';

import { PdfVerifySignaturesResult, VerifySignatureResult, Rectangle, Size, PdfByteRanges, SignatureField } from './models';
import { SignFieldParameters, AddFieldParameters, SignVisualParameters, SignatureParameters, SignDigitalParameters } from './models/parameters';
import { SignerSettings } from './models/settings';
import { emptyRectangle } from './models/rectangle';
import { SigningPdfDocument } from './signing-pdf-document';
import { SignatureEmbeder } from './signature-embeder';
import { SignatureComputer } from './signature-computer';

function takeSnapshot(pdfDoc: PDFDocument, pageNumber?: number): DocumentSnapshot {
    const docSnapshot = pdfDoc.takeSnapshot();

    if(!pageNumber) {
        return docSnapshot;
    }

    const page = pdfDoc.getPage(pageNumber - 1);
    if(!pdfDoc.catalog.AcroForm()) {
        pdfDoc.catalog.getOrCreateAcroForm();
        docSnapshot.markObjForSave(pdfDoc.catalog);
    }
    const form = pdfDoc.getForm();
    docSnapshot.markObjForSave(form.acroForm.dict);
    docSnapshot.markRefForSave(page.ref);

    if (pdfDoc.context.pdfFileDetails.useObjectStreams) {
      const annotsRef = form.acroForm.dict.get(PDFName.of('Fields'));
      if (annotsRef instanceof PDFRef) {
        docSnapshot.markRefForSave(annotsRef);
      }
    }

    return docSnapshot;
}

async function embedSignatureAsync(signature: Buffer, pdfDoc: PDFDocument): Promise<PDFImage> {
    let img: PDFImage;
    try { 
        img = await pdfDoc.embedJpg(signature);
    } catch {
        img = await pdfDoc.embedPng(signature)
    }
    await img.embed();

    return img;
}

function getSignatureEntries(pdfDoc: PDFDocument) {
    return pdfDoc.context.enumerateIndirectObjects()
        .filter(([, obj]) => obj instanceof PDFDict)
        .map(([, dict]) => (dict as PDFDict))
        .filter(dict => {
            return dict.lookupMaybe(PDFName.of('FT'), PDFName) == PDFName.of('Sig')
                && dict.lookupMaybe(PDFName.of('Type'), PDFName) == PDFName.of('Annot')
                && dict.lookupMaybe(PDFName.of('Subtype'), PDFName) == PDFName.of('Widget');
        });
}

function getSignatureFields(pdfDoc: PDFDocument) {
    return getSignatureEntries(pdfDoc)
        .filter(dict => !dict.has(PDFName.of('V')))
        .map(field => field as PDFDict);
}

function getSignatureCount(pdfDoc: PDFDocument) {
    return getSignatureEntries(pdfDoc).length;
}

function getSignatures(pdfDoc: PDFDocument): PDFDict[] {
    return pdfDoc.context.enumerateIndirectObjects()
        .map(([, obj]) => obj)
        .filter(obj => obj instanceof PDFDict)
        .map(obj => obj as PDFDict)
        .filter(dict => dict.lookupMaybe(PDFName.of('Type'), PDFName) == PDFName.of('Sig'));
}

function getPdfRangesFromSignature(signature: PDFDict): PdfByteRanges {
    const byteRange = signature.lookup(PDFName.of('ByteRange'), PDFArray);

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

function getSignBuffer(pdf: Buffer, signRanges: PdfByteRanges): Buffer {
    return Buffer.concat([
        pdf.subarray(signRanges.before.start, signRanges.before.start + signRanges.before.length), 
        pdf.subarray(signRanges.after.start, signRanges.after.start + signRanges.after.length)
    ]);
}

function getSignature(signature: PDFDict): string {
    let signatureHex = signature.lookup(PDFName.of('Contents'), PDFHexString).asString();
    while(signatureHex[signatureHex.length - 1] == '0' && signatureHex[signatureHex.length - 2] == '0') {
        signatureHex = signatureHex.substring(0, signatureHex.length - 2);
    }

    return Buffer.from(signatureHex, 'hex').toString('latin1');
}

function getMessageFromSignature(signature: string) {
    const p7Asn1 = forge.asn1.fromDer(signature);
    return forge.pkcs7.messageFromAsn1(p7Asn1);
} 

function getSignatureDetails(signature: PDFDict): SignatureParameters {
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

function getSignatureName(signature: PDFDict, pdfDoc: PDFDocument): string {
    const signatureField = pdfDoc.context.enumerateIndirectObjects()
        .filter(([, obj]) => obj instanceof PDFDict)
        .map(([, obj]) => obj as PDFDict)
        .find(obj => obj.lookupMaybe(PDFName.of('V'), PDFDict) == signature)!;

    return getString(signatureField, 'T');
}

function getFieldPage(fieldName: string, pdfDoc: PDFDocument) {
    for(let i = 0; i < pdfDoc.getPageCount(); i++) {
        const page = pdfDoc.getPage(i);
        const annots = page.node.Annots();
        if(!annots) {
            continue;
        }
        for(let j = 0; j < annots.size(); j++) {
            const annot = pdfDoc.context.lookup(page.node.Annots()?.get(j), PDFDict);
            if(annot.has(PDFName.of('T')) && annot.lookup(PDFName.of('T'), PDFString).asString() == fieldName) {
                return i;
            }
        } 
    }
    throw new Error(`Signature field '${fieldName}' not found.`);
}

function getString(dict: PDFDict, key: string): string {
    const value = dict.lookup(PDFName.of(key), PDFString);

    return value.asString();
}

function getStringMaybe(dict: PDFDict, key: string): string | undefined {
    const value = dict.lookupMaybe(PDFName.of(key), PDFString);

    return value?.asString();
}

function getDateMaybe(dict: PDFDict, key: string): Date | undefined {
    const value = dict.lookupMaybe(PDFName.of(key), PDFString);

    return value?.decodeDate();
}

function getCoordinate(coordinate: number, limit: number): number {
    return coordinate >= 0
        ? coordinate
        : (limit + coordinate);
}

function getSignatureRectangle(visualRectangle: Rectangle | undefined, pageSize: Size): Rectangle {
    if(!visualRectangle){
        return emptyRectangle;
    }

    return {
        left: getCoordinate(visualRectangle.left, pageSize.width),
        top: pageSize.height - getCoordinate(visualRectangle.top, pageSize.height),
        right: getCoordinate(visualRectangle.right, pageSize.width),
        bottom: pageSize.height - getCoordinate(visualRectangle.bottom, pageSize.height)
    };
}

export class PdfSigner {

    #settings: SignerSettings;
    #signatureComputer: SignatureComputer;

    constructor(settings: SignerSettings) {
        this.#settings = settings;
        this.#signatureComputer = new SignatureComputer(settings.signatureComputer);
    }

    public async addPlaceholderAsync(pdf: Buffer, info: SignDigitalParameters): Promise<Buffer> {
        const signingPdfDoc = await SigningPdfDocument.fromPdfAsync(pdf);
        const pageIndex = info.pageNumber - 1;
        const background = (info.visual && 'background' in info.visual) ? info.visual.background : undefined;
        const texts = (info.visual && 'texts' in info.visual) ? info.visual.texts : undefined;
        const visualRef = await signingPdfDoc.addVisualAsync({ background, texts });
        const placeholderInfo = this.getPlaceholderParameters();
        const placeholderRef = signingPdfDoc.addSignaturePlaceholder({ ...info.signature, ...placeholderInfo });
        const rectangle = info.visual?.rectangle;
        const embedFont = !!(info.visual && 'texts' in info.visual);
        const name = info.name;
        signingPdfDoc.addSignatureField({ name, pageIndex, rectangle, visualRef, placeholderRef, embedFont });
        return signingPdfDoc.saveAsync();
    }

    public async addFieldAsync(pdf: Buffer, info: AddFieldParameters): Promise<Buffer> {
        const signingPdfDoc = await SigningPdfDocument.fromPdfAsync(pdf);
        const pageIndex = info.pageNumber - 1;
        const rectangle = info.rectangle;
        const embedFont = false;
        const name = info.name;
        signingPdfDoc.addSignatureField({ name, pageIndex, rectangle, embedFont });

        return signingPdfDoc.saveAsync();
    }

    public async signAsync(pdf: Buffer, info: SignDigitalParameters): Promise<Buffer> {
        const placeholderPdf = await this.addPlaceholderAsync(pdf, info);
        const signatureEmbeder = await SignatureEmbeder.fromPdfAsync(placeholderPdf);
        const toBeSignedBuffer = signatureEmbeder.getSignBuffer();
        const signature = this.#signatureComputer.computeSignature(toBeSignedBuffer, info.signature?.date || new Date());
        return signatureEmbeder.embedSignature(signature);
    }

    public async signFieldAsync(pdf: Buffer, info: SignFieldParameters): Promise<Buffer> {
        const signingPdfDoc = await SigningPdfDocument.fromPdfAsync(pdf);
        const placeholderInfo = this.getPlaceholderParameters();
        const placeholderRef = signingPdfDoc.addSignaturePlaceholder({ ...info.signature, ...placeholderInfo });
        const visualRef = await signingPdfDoc.addVisualAsync({ ...info.visual });
        const embedFont = !!(info.visual && 'texts' in info.visual);
        signingPdfDoc.updateSignature(info.fieldName, { placeholderRef, visualRef, embedFont });
        const placeholderPdf = await signingPdfDoc.saveAsync();
        const signatureEmbeder = await SignatureEmbeder.fromPdfAsync(placeholderPdf);
        const toBeSignedBuffer = signatureEmbeder.getSignBuffer();
        const signature = this.#signatureComputer.computeSignature(toBeSignedBuffer, info.signature?.date || new Date());
        return signatureEmbeder.embedSignature(signature);
    }

    public async signVisualAsync(pdf: Buffer, info: SignVisualParameters): Promise<Buffer> {
        const pdfDoc = await PDFDocument.load(pdf);
        const signatureCount = getSignatureCount(pdfDoc);
        if(signatureCount) {
            throw new Error('Digital signature found.');
        }

        if(pdfDoc.context.pdfFileDetails.useObjectStreams) { pdfDoc.context.largestObjectNumber += 1; };
        const docSnapshot = takeSnapshot(pdfDoc, info.pageNumber);
        const page = pdfDoc.getPage(info.pageNumber - 1);
        const signatureRect = getSignatureRectangle(info.rectangle, page.getSize());

        const image = await embedSignatureAsync(info.background, pdfDoc);
        page.drawImage(image, { x: signatureRect.left, y: signatureRect.bottom, width: signatureRect.right - signatureRect.left, height: -signatureRect.bottom + signatureRect.top });
        
        const incrementalPdf = Buffer.from(await pdfDoc.saveIncremental(docSnapshot));

        return Buffer.concat([
            pdf,
            incrementalPdf
        ]);    
    }

    public async verifySignaturesAsync(pdf: Buffer): Promise<PdfVerifySignaturesResult | undefined> {
        const pdfDoc = await PDFDocument.load(pdf);
        const signatures = getSignatures(pdfDoc);
        
        if(_.isEmpty(signatures)) {
            return undefined;
        }

        const checks: VerifySignatureResult[] = [];
        for(let i = 0; i < signatures.length; i++) {
            const signature = signatures[i];
            const check = await this.verifySignatureAsync(signature, pdf, i == signatures.length - 1, pdfDoc);
            checks.push(check);
        }

        return {
            integrity: checks.every(check => check.integrity),
            signatures: checks
        };
    }

    public async getFieldsAsync(pdf: Buffer): Promise<SignatureField[]> {
        const pdfDoc = await PDFDocument.load(pdf);
        return getSignatureFields(pdfDoc)
            .map(dict => {
                const name = dict.lookup(PDFName.of('T'), PDFString).asString();
                const pageIndex = getFieldPage(name, pdfDoc);
                return {
                    name,
                    pageNumber: pageIndex + 1
                }
            });
    }

    private async verifySignatureAsync(signature: PDFDict, pdf: Buffer, isLast: boolean, pdfDoc: PDFDocument): Promise<VerifySignatureResult> {
        const signRanges = getPdfRangesFromSignature(signature); 
        const signBuffer = getSignBuffer(pdf, signRanges);
        const signatureStr = getSignature(signature);
        const message = getMessageFromSignature(signatureStr);

        const appended = isLast && signRanges.after.start + signRanges.after.length < pdf.length;
        
        const { 
            rawCapture: {
                authenticatedAttributes,
                 digestAlgorithm,
            },
        } = message;
        const hashAlgorithmOid = forge.asn1.derToOid(digestAlgorithm);
        const hashAlgorithm = forge.pki.oids[hashAlgorithmOid].toLowerCase();
        const messageDigestAttr = forge.pki.oids.messageDigest;
        const fullAttrDigest = authenticatedAttributes.find((attr: any) => forge.asn1.derToOid(attr.value[0].value) === messageDigestAttr);
        const attrDigest = fullAttrDigest.value[1].value[0].value;
        const dataDigest = (forge.md as any)[hashAlgorithm]
                .create()
                .update(signBuffer.toString('latin1'))
                .digest()
                .getBytes();

        const integrity = dataDigest === attrDigest;
    
        return {
            name: getSignatureName(signature, pdfDoc),
            integrity: integrity && !appended,
            details: getSignatureDetails(signature)
        };
    }

    private getPlaceholderParameters() {
        return {
            signaturePlaceholder: 'A'.repeat(this.#settings.signatureLength),
            rangePlaceHolder: this.#settings.rangePlaceHolder
        };
    }
}
