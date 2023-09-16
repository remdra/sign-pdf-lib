import { PDFArray, PDFContext, PDFDict, PDFDocument, PDFHexString, PDFImage, PDFName, PDFNumber, PDFPage, PDFRawStream, PDFRef, PDFString } from 'pdf-lib';
import * as _ from 'lodash';
import * as forge from 'node-forge';

import { PdfCheckResult, SignatureCheckResult, SignatureDetails } from './models/check-result';
import { PdfByteRanges } from './models/byte-range';
import { SignatureSettings } from './models/signature-settings';
import { SignatureInfo } from './models/signature-info';
import { emptyRectangle, Rectangle } from './models/rectangle';


function getSignatureDictRef(info: SignatureInfo, settings: SignatureSettings, context: PDFContext) {

    const byteRange = context.obj([ 0, settings.rangePlaceHolder, settings.rangePlaceHolder, settings.rangePlaceHolder ]);

    const signatureDict = PDFDict.withContext(context);
    signatureDict.set(PDFName.of('Type'), PDFName.of('Sig'));
    signatureDict.set(PDFName.of('Filter'), PDFName.of('Adobe.PPKLite'));
    signatureDict.set(PDFName.of('SubFilter'), PDFName.of('adbe.pkcs7.detached'));
    signatureDict.set(PDFName.of('Contents'), PDFHexString.of('A'.repeat(settings.signatureLength)));
    signatureDict.set(PDFName.of('ByteRange'), byteRange);
    if(info.name) { signatureDict.set(PDFName.of('Name'), PDFString.of(info.name)); };
    if(info.location) { signatureDict.set(PDFName.of('Location'), PDFString.of(info.location)); };
    if(info.reason) { signatureDict.set(PDFName.of('Reason'), PDFString.of(info.reason)); };
    if(info.modified) { signatureDict.set(PDFName.of('M'), PDFString.fromDate(info.modified)); };
    if(info.contactInfo) { signatureDict.set(PDFName.of('ContactInfo'), PDFString.of(info.contactInfo)); };

    return context.register(signatureDict);
}

function getAppearanceDict(context: PDFContext) {
    const appearanceDict = PDFDict.withContext(context);
    appearanceDict.set(PDFName.of('FT'), PDFName.of('XObject'));
    appearanceDict.set(PDFName.of('Subtype'), PDFName.of('Form'));

    return appearanceDict;
}

function getAppearanceStreamRef(signatureRef: PDFRef, signatureNumber: number, context: PDFContext): PDFRef {
    const drawBuffer = Buffer.from(`q 1 0 0 1 0 0 cm /frm${signatureNumber} Do Q`);
    const boundingBox = context.obj([ 0.0, 0.0, 100.0, 100.0 ]);

    const appearanceDict = getAppearanceDict(context);
    appearanceDict.set(PDFName.of('BBox'), boundingBox);
    appearanceDict.set(PDFName.of('Resources'), getSignatureObj(signatureRef, signatureNumber, context));
    appearanceDict.set(PDFName.of('Length'), PDFNumber.of(drawBuffer.length));

    const rawStream = PDFRawStream.of(appearanceDict, drawBuffer);
    return context.register(rawStream);
}

function getNormalAppearanceDict(appearanceStreamRef: PDFRef, context: PDFContext) {
    const normalAppearanceDict = PDFDict.withContext(context);
    normalAppearanceDict.set(PDFName.of('N'), appearanceStreamRef);

    return normalAppearanceDict;
}

function getSignatureFieldDictRef(signatureNumber: number, pageRef: PDFRef, normalAppearanceDict:PDFDict | undefined, signatureDictRef: PDFRef, signatureRect: Rectangle, context: PDFContext): PDFRef {
    const signatureFieldDict = PDFDict.withContext(context);
    signatureFieldDict.set(PDFName.of('FT'), PDFName.of('Sig'));
    signatureFieldDict.set(PDFName.of('Type'), PDFName.of('Annot'));
    signatureFieldDict.set(PDFName.of('Subtype'), PDFName.of('Widget'));
    signatureFieldDict.set(PDFName.of('T'), PDFString.of(`Signature${signatureNumber}`));
    signatureFieldDict.set(PDFName.of('F'), PDFNumber.of(132));
    signatureFieldDict.set(PDFName.of('P'), pageRef);
    signatureFieldDict.set(PDFName.of('V'), signatureDictRef);
    if(normalAppearanceDict) {
        signatureFieldDict.set(PDFName.of('AP'), normalAppearanceDict);
    }
    const boundingBox = context.obj([ signatureRect.left, signatureRect.top, signatureRect.right, signatureRect.bottom ]);
    signatureFieldDict.set(PDFName.of('Rect'), boundingBox);

    return context.register(signatureFieldDict);
}


function getPageAnnots(page: PDFPage, context: PDFContext) {
    let annots = page.node.lookupMaybe(PDFName.of('Annots'), PDFArray);
    if(!annots) {
        annots = PDFArray.withContext(context);
        page.node.set(PDFName.of('Annots'), annots);
    }

    return annots;
}

async function getSignatureStreamRefAsync(signature: Buffer, pdfDoc: PDFDocument): Promise<PDFRef> {
    let img: PDFImage;
    try { 
        img = await pdfDoc.embedJpg(signature);
    } catch {
        img = await pdfDoc.embedPng(signature)
    }
    await img.embed();
    const found = pdfDoc.context.enumerateIndirectObjects()
        .find(([ref, obj]) => ref.objectNumber == img.ref.objectNumber);
    
    return found![0];
}


function getSignatureImageStreamRef(signatureImageStreamRef: PDFRef, signatureNumber: number, context: PDFContext): PDFRef {
    const drawBuffer = Buffer.from(`q 100 0 0 100 0 0 cm /jpg${signatureNumber} Do Q`);

    const jpgDict = PDFDict.withContext(context);
    jpgDict.set(PDFName.of(`jpg${signatureNumber}`), signatureImageStreamRef);
    
    const objDict = PDFDict.withContext(context);
    objDict.set(PDFName.of('XObject'), jpgDict);

    const dict = PDFDict.withContext(context);
    dict.set(PDFName.of('Type'), PDFName.of('XObject'));
    dict.set(PDFName.of('Subtype'), PDFName.of('Form'));
    dict.set(PDFName.of('BBox'), context.obj([ 0.0, 0.0, 100.0, 100.0 ]));
    dict.set(PDFName.of('Resources'), objDict);
    dict.set(PDFName.of('Length'), PDFNumber.of(drawBuffer.length));

    const rawStream = PDFRawStream.of(dict, drawBuffer);
    return context.register(rawStream);
}

function getSignatureObj(ref: PDFRef, signatureNumber: number, context: PDFContext): PDFDict {
    const frmDict = PDFDict.withContext(context);
    frmDict.set(PDFName.of(`frm${signatureNumber}`), ref);
    
    const dict = PDFDict.withContext(context);
    dict.set(PDFName.of('XObject'), frmDict);
    
    return dict;
}

function getSignatureCount(context: PDFContext) {
    return context.enumerateIndirectObjects()
        .filter(([, obj]) => obj instanceof PDFDict)
        .map(([, dict]) => (dict as PDFDict))
        .filter(dict => {
            return dict.lookupMaybe(PDFName.of('FT'), PDFName) == PDFName.of('Sig')
                && dict.lookupMaybe(PDFName.of('Type'), PDFName) == PDFName.of('Annot')
                && dict.lookupMaybe(PDFName.of('Subtype'), PDFName) == PDFName.of('Widget');
        })
        .length;
}

function getSignatureRange(pdf: Buffer) {
    let contentsStartIndex = 0;
    while(pdf[contentsStartIndex] != '<'.charCodeAt(0)) {
        contentsStartIndex = pdf.indexOf('/Contents', contentsStartIndex) + '/Contents'.length;
        while(pdf[contentsStartIndex] == ' '.charCodeAt(0)) {
            contentsStartIndex++;
        }
    }
    const start = pdf.indexOf('<', contentsStartIndex) + 1;
    const end = pdf.indexOf('>', start);

    return {
        start,
        end
    };
}

function getPdfSigningRanges(initialPdf: Buffer, incrementalPdf: Buffer): PdfByteRanges {
    const { start: startSignature, end: endSignature } = getSignatureRange(incrementalPdf);

    return {
        rangeBefore: {
            start: 0,
            length: initialPdf.length + startSignature - 1
        },
        signature: {
            start: initialPdf.length + startSignature - 1,
            length: endSignature - startSignature + 2
        },
        rangeAfter: {
            start: initialPdf.length + endSignature + 1,
            length: incrementalPdf.length - endSignature - 1
        }
    };
}

function updateByteRange(incrementalPdf: Buffer, initialPdf: Buffer, context: PDFContext) {

    const { rangeBefore, rangeAfter } = getPdfSigningRanges(initialPdf, incrementalPdf);

    const byteRangeArray = context.obj([ rangeBefore.start, rangeBefore.length, rangeAfter.start, rangeAfter.length ]);
    const byteRangeStartIndex = incrementalPdf.indexOf('/ByteRange');
    const startOfByteRange = incrementalPdf.indexOf('[', byteRangeStartIndex);
    const endOfByteRange = incrementalPdf.indexOf(']', startOfByteRange) + 1;
    if(endOfByteRange - startOfByteRange < byteRangeArray.sizeInBytes()) {
        throw new Error('Not enough space to store range.');
    }
    const byteRangeBuffer = Buffer.from(' '.repeat(endOfByteRange - startOfByteRange));
    byteRangeArray.copyBytesInto(byteRangeBuffer, 0);

    return Buffer.concat([ 
        incrementalPdf.subarray(0, startOfByteRange),
        byteRangeBuffer,
        incrementalPdf.subarray(endOfByteRange)
    ]);
}

function addSignatureFieldDict(signatureFieldDictRef: PDFRef, page: PDFPage, pdfDoc: PDFDocument) {
    const annots = getPageAnnots(page, pdfDoc.context);
    annots.push(signatureFieldDictRef);
 
    const form = pdfDoc.getForm();
    form.acroForm.dict.set(PDFName.of('SigFlags'), PDFNumber.of(3));
    form.acroForm.dict.set(PDFName.of('Fields'), annots);
}

function addSignatureFieldDictStreams(signatureFieldDictRef: PDFRef, page: PDFPage, pdfDoc: PDFDocument) {
    const form = pdfDoc.getForm();
    let annots = form.acroForm.dict.get(PDFName.of('Fields'));
    if(annots instanceof PDFRef) {
        annots = pdfDoc.context.lookup(annots);
    }
    form.acroForm.dict.set(PDFName.of('SigFlags'), PDFNumber.of(3));
    (annots as PDFArray).push(signatureFieldDictRef);
}

function getSignatures(pdfDoc: PDFDocument): PDFDict[] {
    return pdfDoc.context.enumerateIndirectObjects()
        .map(([, obj]) => obj)
        .filter(obj => obj instanceof PDFDict)
        .map(obj => obj as PDFDict)
        .filter(dict => dict.lookupMaybe(PDFName.of('Type'), PDFName) == PDFName.of('Sig'));
}

async function getPdfRangesAsync(pdf: Buffer): Promise<PdfByteRanges> {
    const pdfDoc = await PDFDocument.load(pdf);

    const signatures = getSignatures(pdfDoc);
    const lastSignature = _.last(signatures);
    
    return getPdfRangesFromSignature(lastSignature!);
}

function getPdfRangesFromSignature(signature: PDFDict): PdfByteRanges {
    const byteRange = signature.lookup(PDFName.of('ByteRange'), PDFArray);

    const start1 = (byteRange.get(0) as PDFNumber).asNumber();
    const length1 = (byteRange.get(1) as PDFNumber).asNumber();
    const start2 = (byteRange.get(2) as PDFNumber).asNumber();
    const length2 = (byteRange.get(3) as PDFNumber).asNumber();


    return {
        rangeBefore: {
            start: start1,
            length: length1
        },
        signature: {
            start: start1 + length1,
            length: start2 - (start1 + length1)
        },
        rangeAfter: {
            start: start2,
            length: length2
        }
    };
}

function getSignBuffer(pdf: Buffer, signRanges: PdfByteRanges): Buffer {
    return Buffer.concat([
        pdf.subarray(signRanges.rangeBefore.start, signRanges.rangeBefore.start + signRanges.rangeBefore.length), 
        pdf.subarray(signRanges.rangeAfter.start, signRanges.rangeAfter.start + signRanges.rangeAfter.length)
    ]);
}

function embedSignature(signature: Buffer, placeholderPdf: Buffer, pdfRanges: PdfByteRanges): Buffer {
    const hexSignature = signature.toString('hex').toUpperCase();

    const signatureLen = pdfRanges.signature.length;
    if(signatureLen < hexSignature.length) {
        throw new Error('Not enough space to store signature.');
    }
    const diff = signatureLen - hexSignature.length - 2;
    const fullSignature = Buffer.concat([Buffer.from(hexSignature.toUpperCase()), Buffer.from('0'.repeat(diff))]);

    return Buffer.concat([
        placeholderPdf.subarray(pdfRanges.rangeBefore.start, pdfRanges.rangeBefore.start + pdfRanges.rangeBefore.length + 1), 
        fullSignature, 
        placeholderPdf.subarray(pdfRanges.rangeAfter.start - 1)
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

function getSignatureDetails(signature: PDFDict): SignatureDetails {
    const details: SignatureDetails = {};
    
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
        .find(obj => obj.lookupMaybe(PDFName.of('V'), PDFDict) == signature);

    return getString(signatureField!, 'T');
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

interface SigningSettings {
    privateKey: any;
    certificate: any;
    certificates: any[];
}

function getSigningSettingsP12(p12Certificate: Buffer, certificatePassword: string): SigningSettings {
    const forgeCert = forge.util.createBuffer(p12Certificate.toString('binary'));
    const p12Asn1 = forge.asn1.fromDer(forgeCert);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, certificatePassword);

    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag];
    if(!certBags) {
        throw new Error('Invalid "certBags".');
    }
    const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag];
    if(!keyBags) {
        throw new Error('Invalid "keyBags".');
    }

    const privateKey = keyBags[0].key as any;
    if(!privateKey) {
        throw new Error('Invalid "privateKey".');
    }

    const certificates: any[] = [];
    let certificate;
    Object.keys(certBags).forEach((i) => {
        const cert = (certBags as any)[i].cert;
        const { publicKey } = cert;

        certificates.push(cert);

        if (privateKey.n.compareTo(publicKey.n) === 0
            && privateKey.e.compareTo(publicKey.e) === 0
        ) {
            certificate = cert;
        }
    });

    if (typeof certificate === 'undefined') {
        throw new Error('Failed to find a certificate that matches the private key.');
    }

    return {
        privateKey,
        certificate,
        certificates
    };
}


function getSigningSettingsPem(pemCertificate: string, pemKey: string, certificatePassword: string): SigningSettings {
    const privateKey = forge.pki.decryptRsaPrivateKey(pemKey, certificatePassword);
    var certificate = forge.pki.certificateFromPem(pemCertificate);

    return {
        privateKey,
        certificate,
        certificates: [ certificate ]
    };
}

export class PdfSigner {

    constructor(
        private settings: SignatureSettings
    ) {
    }

    public async addPlaceholderAsync(pdf: Buffer, info: SignatureInfo): Promise<Buffer> {
        const pdfDoc = await PDFDocument.load(pdf);
        if(pdfDoc.context.pdfFileDetails.useObjectStreams) { pdfDoc.context.largestObjectNumber += 1; };
        const docSnapshot = pdfDoc.takeSnapshot({ pageIndex: info.pageNumber - 1 });
        const signatureNumber = getSignatureCount(pdfDoc.context) + 1;
        const page = pdfDoc.getPage(info.pageNumber - 1);

        let normalAppearanceDict;
        if(info.visual) {
            const signatureImageStreamRef = await getSignatureStreamRefAsync(info.visual.image, pdfDoc);
            const signatureImageStreamRef2 = getSignatureImageStreamRef(signatureImageStreamRef, signatureNumber, pdfDoc.context);
            const appearanceStreamRef = getAppearanceStreamRef(signatureImageStreamRef2, signatureNumber, pdfDoc.context);
            normalAppearanceDict = getNormalAppearanceDict(appearanceStreamRef, pdfDoc.context); 

            const form = pdfDoc.getForm();
            form.acroForm.dict.set(PDFName.of('DR'), getSignatureObj(signatureImageStreamRef2, signatureNumber, pdfDoc.context));
        }

        const signatureDictRef = getSignatureDictRef(info, this.settings, pdfDoc.context);
        const signatureRect = info.visual ? info.visual.imageRectangle : emptyRectangle;
        const signatureFieldDictRef = getSignatureFieldDictRef(signatureNumber, page.ref, normalAppearanceDict, signatureDictRef, signatureRect, pdfDoc.context);
        if(pdfDoc.context.pdfFileDetails.useObjectStreams) {
            addSignatureFieldDictStreams(signatureFieldDictRef, page, pdfDoc);
        } else {
            addSignatureFieldDict(signatureFieldDictRef, page, pdfDoc);
        }
        let incrementalPdf = Buffer.from(await pdfDoc.saveIncremental(docSnapshot));
        incrementalPdf = updateByteRange(incrementalPdf, pdf, pdfDoc.context);

        return Buffer.concat([
            pdf,
            incrementalPdf
        ]);
    }

    public async signAsync(pdf: Buffer, info: SignatureInfo): Promise<Buffer> {
        const placeholderPdf = await this.addPlaceholderAsync(pdf, info);
        const pdfRanges = await getPdfRangesAsync(placeholderPdf);
        const toBeSignedBuffer = getSignBuffer(placeholderPdf, pdfRanges);
        const signature = this.computeSignature(toBeSignedBuffer, info.modified || new Date());
        return embedSignature(signature, placeholderPdf, pdfRanges);
    }

    public async verifySignaturesAsync(pdf: Buffer): Promise<PdfCheckResult | undefined> {
        const pdfDoc = await PDFDocument.load(pdf);
        const signatures = getSignatures(pdfDoc);
        
        if(_.isEmpty(signatures)) {
            return undefined;
        }

        const checks: SignatureCheckResult[] = [];
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

    private async verifySignatureAsync(signature: PDFDict, pdf: Buffer, isLast: boolean, pdfDoc: PDFDocument): Promise<SignatureCheckResult> {
        const signRanges = getPdfRangesFromSignature(signature); 
        const signBuffer = getSignBuffer(pdf, signRanges);
        const signatureStr = getSignature(signature);
        const message = getMessageFromSignature(signatureStr);

        const appended = isLast && signRanges.rangeAfter.start + signRanges.rangeAfter.length < pdf.length;
        
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

    private computeSignature(signBuffer: Buffer, date: Date): Buffer {
        const { privateKey, certificates, certificate } = this.getSigningSettings();

        const p7 = forge.pkcs7.createSignedData();
        p7.content = forge.util.createBuffer(signBuffer.toString('binary'));
        certificates.forEach(cert => p7.addCertificate(cert));
        p7.addSigner({
            key: privateKey,
            certificate,
            digestAlgorithm: forge.pki.oids.sha256,
            authenticatedAttributes: [
                {
                    type: forge.pki.oids.contentType,
                    value: forge.pki.oids.data
                }, {
                    type: forge.pki.oids.messageDigest
                }, {
                    type: forge.pki.oids.signingTime,
                    value: PDFString.fromDate(date).asString()
                }
            ],
        });

        p7.sign({ detached: true });

        return Buffer.from(forge.asn1.toDer(p7.toAsn1()).getBytes(), 'binary');
    }

    private getSigningSettings() : SigningSettings {
        if(this.settings.pemCertificate && this.settings.pemKey) {
            return getSigningSettingsPem(this.settings.pemCertificate, this.settings.pemKey, this.settings.certificatePassword);
        } else if(this.settings.p12Certificate) {
            return getSigningSettingsP12(this.settings.p12Certificate, this.settings.certificatePassword);
        } else {
            throw new Error('No certificate specified.');
        }
    }
}
