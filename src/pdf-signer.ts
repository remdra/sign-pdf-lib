import { DocumentSnapshot, PDFArray, PDFContext, PDFDict, PDFDocument, PDFHexString, PDFImage, PDFName, PDFNumber, PDFPage, PDFRef, PDFStream, PDFString } from 'pdf-lib';
import * as _ from 'lodash';
import * as forge from 'node-forge';

import { PdfVerifySignaturesResult, VerifySignatureResult, SignDigitalParameters, SignFieldParameters, AddFieldParameters, SignVisualParameters, SignatureParameters, SignerSettings, Rectangle, Size, PdfByteRanges, SignatureText } from './models/index';
import { emptyRectangle } from './models/rectangle';
import { SignatureField } from './models/signature-field';

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

function getSignatureDictRef(info: SignatureParameters, settings: SignerSettings, context: PDFContext) {

    const signature: any = {
        'Type': 'Sig',
        'Filter': 'Adobe.PPKLite',
        'SubFilter': 'adbe.pkcs7.detached',
       'Contents': PDFHexString.of('A'.repeat(settings.signatureLength)),
        'ByteRange': [ 0, settings.rangePlaceHolder, settings.rangePlaceHolder, settings.rangePlaceHolder ]
    };
    if(info.name) { signature['Name'] = PDFString.of(info.name); };
    if(info.location) { signature['Location'] = PDFString.of(info.location); };
    if(info.reason) { signature['Reason'] = PDFString.of(info.reason); };
    if(info.date) { signature['M'] = PDFString.fromDate(info.date); };
    if(info.contactInfo) { signature['ContactInfo'] = PDFString.of(info.contactInfo); };

    const obj = context.obj(signature) as any as PDFDict; 
    return context.register(obj);
}

function addSignatureValue(pdfDoc: PDFDocument, signatureFieldDictRef: PDFRef, signatureDictRef: PDFRef) {
    const signatureFieldDict = pdfDoc.context.lookup(signatureFieldDictRef, PDFDict);
    signatureFieldDict.set(PDFName.of('V'), signatureDictRef);
}

function getAppearanceDict(context: PDFContext) {
    const appearance = {
        'FT': 'XObject',
        'Subtype': 'Form'
    }

    return context.obj(appearance);
}

function getAppearanceStream(signatureRef: PDFRef | undefined, texts: SignatureText[], signatureNumber: number, context: PDFContext): PDFStream {
    if(!texts[0]) {
        texts.push({lines: []});
    }
    if(!texts[1]) {
        texts.push({lines: []});
    }
    while(texts[0].lines.length < 2) {
        texts[0].lines.push('');
    }
    while(texts[1].lines.length < 4) {
        texts[1].lines.push('');
    }
    let drawBuffer = signatureRef 
        ? `q 2.14 0 0 0.7 0 0 cm /frm${signatureNumber} Do Q`
        : '% DSBlank';
    const full = texts[0].lines.join('') + texts[1].lines.join('');
    if(!_.isEmpty(full)) {
        drawBuffer = drawBuffer
            + ' q'
            + ' 0 0 106 68 re'
            + ' BT'
            + ' /Helvetica 1 Tf'
            + ' 0 Tc 0 Tw 0 Ts 100 Tz 0 Tr'
            + ' 27.849 0 0 27.849 1 43.646 Tm'
            + ` (${texts[0].lines[0]})Tj`
            + ' 0 -1.2 TD'
            + ` (${texts[0].lines[1]})Tj`
            + ' 12.637 0 0 12.637 109.1188 54.087 Tm'
            + ` (${texts[1].lines[0]})Tj`
            + ' T*'
            + ` (${texts[1].lines[1]})Tj`
            + ' T*'
            + ` (${texts[1].lines[2]})Tj`
            + ' T*'
            + ` (${texts[1].lines[3]})Tj`
            + ' ET'
            + ' Q';
    }

    const appearance: any = {
        'FT': 'XObject',
        'Subtype': 'Form',
        'BBox': [ 0.0, 0.0, 214, 70.0 ],
    }
    /*    
    const drawBuffer = signatureRef 
        ? `q 1 0 0 1 0 0 cm /frm${signatureNumber} Do Q`
        : '% DSBlank';

    const appearance: any = {
        'FT': 'XObject',
        'Subtype': 'Form',
        'BBox': [ 0.0, 0.0, 100.0, 100.0 ],
    }
    */

    if(signatureRef) { appearance['Resources'] = getSignatureObj(signatureRef, signatureNumber, context); }

    return context.stream(drawBuffer, appearance);
}

function getAppearanceStreamRef(signatureRef: PDFRef | undefined, texts: SignatureText[], signatureNumber: number, context: PDFContext): PDFRef {
    const rawStream = getAppearanceStream(signatureRef, texts, signatureNumber, context);
    return context.register(rawStream);
}

function getNormalAppearanceDict(appearanceStreamRef: PDFRef, context: PDFContext): PDFDict {
    const appearance = {
        'N': appearanceStreamRef
    };

    return context.obj(appearance);
}

function getSignatureFieldDictRef(signatureNumber: number, pageRef: PDFRef, normalAppearanceDict:PDFDict | undefined, signatureRect: Rectangle, context: PDFContext): PDFRef {
    const signature: any = {
        'FT': 'Sig',
        'Type': 'Annot',
        'Subtype': 'Widget',
        'T': PDFString.of(`Signature${signatureNumber}`),
        'F': 132,
        'P': pageRef,
        'Rect': [ signatureRect.left, signatureRect.top, signatureRect.right, signatureRect.bottom ]
    };
    if(normalAppearanceDict) {
        signature['AP'] = normalAppearanceDict;
    }
    
    const obj = context.obj(signature) as any as PDFDict;
    return context.register(obj);
}


function getPageAnnots(page: PDFPage, context: PDFContext) {
    let annots = page.node.lookupMaybe(PDFName.of('Annots'), PDFArray);
    if(annots) {
        return annots;
    }
    
    annots = context.obj([]);
    page.node.set(PDFName.of('Annots'), annots);

    return annots;
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

async function getSignatureStreamRefAsync(signature: Buffer, pdfDoc: PDFDocument): Promise<PDFRef> {
    const img = await embedSignatureAsync(signature, pdfDoc);
    return img.ref;
}


function getSignatureImageStreamRef(signatureImageStreamRef: PDFRef, signatureNumber: number, context: PDFContext): PDFRef {
    const drawBuffer = `q 100 0 0 100 0 0 cm /jpg${signatureNumber} Do Q`;

    const r = context.stream(drawBuffer, {
        'Type': 'XObject',
        'Subtype': 'Form',
        'BBox': [ 0.0, 0.0, 100.0, 100.0 ],
        'Resources': {
            'XObject': {
                [`jpg${signatureNumber}`]: signatureImageStreamRef
            }
        }
    });
    return context.register(r);
}

function getSignatureObj(ref: PDFRef, signatureNumber: number, context: PDFContext): PDFDict {
    
    const xObj = {
        'XObject': {
            [`frm${signatureNumber}`]: ref
        }
    };
    
    return context.obj(xObj);
}

function getSignatureEntries(pdfDoc: PDFDocument) {
    pdfDoc.context.formXObject
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

function getSignatureField(pdfDoc: PDFDocument, name: string): PDFDict {
    const fields = getSignatureFields(pdfDoc);
    const found = fields.find(field => field.lookup(PDFName.of('T'), PDFString).asString() === name);
    if(!found) {
        throw new Error(`Signature field '${name}' not found.`);
    }
    return found;
}

function getSignatureCount(pdfDoc: PDFDocument) {
    return getSignatureEntries(pdfDoc).length;
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

    const pageAnnots = getPageAnnots(page, pdfDoc.context);
    pageAnnots.push(signatureFieldDictRef);
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
    const lastSignature = _.last(signatures)!;
    
    return getPdfRangesFromSignature(lastSignature);
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

function embedHexSignature(hexSignature: string, placeholderPdf: Buffer, pdfRanges: PdfByteRanges): Buffer {
    const signatureLen = pdfRanges.signature.length;
    if(signatureLen < hexSignature.length) {
        throw new Error('Not enough space to store signature.');
    }
    const diff = signatureLen - hexSignature.length - 2;
    const fullSignature = Buffer.concat([Buffer.from(hexSignature), Buffer.from('0'.repeat(diff))]);

    return Buffer.concat([
        placeholderPdf.subarray(pdfRanges.rangeBefore.start, pdfRanges.rangeBefore.start + pdfRanges.rangeBefore.length + 1), 
        fullSignature, 
        placeholderPdf.subarray(pdfRanges.rangeAfter.start - 1)
    ]);
}

function embedSignature(signature: Buffer, placeholderPdf: Buffer, pdfRanges: PdfByteRanges): Buffer {
    const hexSignature = signature.toString('hex').toUpperCase();

    return embedHexSignature(hexSignature, placeholderPdf, pdfRanges);
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

    constructor(
        private settings: SignerSettings
    ) {
    }

    public async addPlaceholderAsync(pdf: Buffer, info: SignDigitalParameters): Promise<Buffer> {
        const pdfDoc = await PDFDocument.load(pdf);
        if(pdfDoc.context.pdfFileDetails.useObjectStreams) { pdfDoc.context.largestObjectNumber += 1; };
        const docSnapshot = takeSnapshot(pdfDoc, info.pageNumber);
        const signatureNumber = getSignatureCount(pdfDoc) + 1;
        const page = pdfDoc.getPage(info.pageNumber - 1);

        let normalAppearanceDict;
        if(info.visual) {
            const signatureImageStreamRef = await getSignatureStreamRefAsync(info.visual.background, pdfDoc);
            const signatureImageStreamRef2 = getSignatureImageStreamRef(signatureImageStreamRef, signatureNumber, pdfDoc.context);
            const appearanceStreamRef = getAppearanceStreamRef(signatureImageStreamRef2, [], signatureNumber, pdfDoc.context);
            normalAppearanceDict = getNormalAppearanceDict(appearanceStreamRef, pdfDoc.context); 

            const form = pdfDoc.getForm();
            form.acroForm.dict.set(PDFName.of('DR'), getSignatureObj(signatureImageStreamRef2, signatureNumber, pdfDoc.context));
        }

        const signatureDictRef = getSignatureDictRef(info, this.settings, pdfDoc.context);
        const signatureRect = getSignatureRectangle(info.visual?.rectangle, page.getSize());
        const signatureFieldDictRef = getSignatureFieldDictRef(signatureNumber, page.ref, normalAppearanceDict, signatureRect, pdfDoc.context);
        addSignatureValue(pdfDoc, signatureFieldDictRef, signatureDictRef);
        if(pdfDoc.context.pdfFileDetails.useObjectStreams) {
            addSignatureFieldDictStreams(signatureFieldDictRef, page, pdfDoc);
        } else {
            addSignatureFieldDict(signatureFieldDictRef, page, pdfDoc);
        }
        /*const fontDict = page.node.lookup(PDFName.of('Resources'), PDFDict).lookup(PDFName.of('Font'), PDFDict);
        if(!fontDict.has(PDFName.of('Helvetica'))) {
            const font = pdfDoc.context.obj({
                'Type': 'Font',
                'Subtype': 'Type1',
                'BaseFont': 'Helvetica',
                'Encoding': 'WinAnsiEncoding'
            });
            const fontRef = pdfDoc.context.register(font);
            fontDict.set(PDFName.of('Helvetica'), fontRef);
            if(page.node.get(PDFName.of('Resources')) instanceof PDFRef) {
                docSnapshot.markObjForSave(page.node.lookup(PDFName.of('Resources'))!);
            } else {
                docSnapshot.markRefForSave(page.ref);
            }
        }
        */
        let incrementalPdf = Buffer.from(await pdfDoc.saveIncremental(docSnapshot));
        incrementalPdf = updateByteRange(incrementalPdf, pdf, pdfDoc.context);

        return Buffer.concat([
            pdf,
            incrementalPdf
        ]);
    }

    public async addFieldAsync(pdf: Buffer, info: AddFieldParameters): Promise<Buffer> {
        const pdfDoc = await PDFDocument.load(pdf);
        if(pdfDoc.context.pdfFileDetails.useObjectStreams) { pdfDoc.context.largestObjectNumber += 1; };
        const docSnapshot = takeSnapshot(pdfDoc, info.pageNumber);
        const signatureNumber = getSignatureCount(pdfDoc) + 1;
        const page = pdfDoc.getPage(info.pageNumber - 1);

        const appearanceStreamRef = getAppearanceStreamRef(undefined, [], signatureNumber, pdfDoc.context);
        const normalAppearanceDict = getNormalAppearanceDict(appearanceStreamRef, pdfDoc.context); 
        const signatureRect = getSignatureRectangle(info.rectangle, page.getSize());
        const signatureFieldDictRef = getSignatureFieldDictRef(signatureNumber, page.ref, normalAppearanceDict, signatureRect, pdfDoc.context);
        if(pdfDoc.context.pdfFileDetails.useObjectStreams) {
            addSignatureFieldDictStreams(signatureFieldDictRef, page, pdfDoc);
        } else {
            addSignatureFieldDict(signatureFieldDictRef, page, pdfDoc);
        }
        const incrementalPdf = Buffer.from(await pdfDoc.saveIncremental(docSnapshot));

        return Buffer.concat([
            pdf,
            incrementalPdf
        ]);
    }

    public async signAsync(pdf: Buffer, info: SignDigitalParameters): Promise<Buffer> {
        const placeholderPdf = await this.addPlaceholderAsync(pdf, info);
        const pdfRanges = await getPdfRangesAsync(placeholderPdf);
        const toBeSignedBuffer = getSignBuffer(placeholderPdf, pdfRanges);
        const signature = this.computeSignature(toBeSignedBuffer, info.date || new Date());
        return embedSignature(signature, placeholderPdf, pdfRanges);
    }

    public async signFieldAsync(pdf: Buffer, info: SignFieldParameters): Promise<Buffer> {
        const pdfDoc = await PDFDocument.load(pdf);

        const signatureNumber = getSignatureCount(pdfDoc);
        const form = pdfDoc.getForm();

        if(pdfDoc.context.pdfFileDetails.useObjectStreams) { pdfDoc.context.largestObjectNumber += 1; };
        const docSnapshot = takeSnapshot(pdfDoc);

        const signatureFieldDict = getSignatureField(pdfDoc, info.fieldName);
        const signatureFieldDictRef = pdfDoc.context.getObjectRef(signatureFieldDict)!;
        const signatureDictRef = getSignatureDictRef(info, this.settings, pdfDoc.context);
        addSignatureValue(pdfDoc, signatureFieldDictRef, signatureDictRef);
        
        const signatureImageStreamRef = await getSignatureStreamRefAsync(info.background, pdfDoc);
        const signatureImageStreamRef2 = getSignatureImageStreamRef(signatureImageStreamRef, signatureNumber, pdfDoc.context);
        const signatureObj = getSignatureObj(signatureImageStreamRef2, signatureNumber, pdfDoc.context);
        if(!form.acroForm.dict.has(PDFName.of('DR'))) {          
            form.acroForm.dict.set(PDFName.of('DR'), signatureObj);
        } else {
            const drObj = form.acroForm.dict.lookup(PDFName.of('DR'), PDFDict);
            const drRef = pdfDoc.context.getObjectRef(drObj)!;
            if(drRef) {
                pdfDoc.context.assign(drRef, signatureObj);
            }
        }

        const nRawStream = signatureFieldDict.lookup(PDFName.of('AP'), PDFDict).lookup(PDFName.of('N'), PDFStream)!;
        const nRef = pdfDoc.context.getObjectRef(nRawStream)!;
        const appearanceStream = getAppearanceStream(signatureImageStreamRef2, info.texts, signatureNumber, pdfDoc.context);
        pdfDoc.context.assign(nRef, appearanceStream);

        docSnapshot.markObjsForSave([ form.acroForm.dict ]);
        docSnapshot.markRefsForSave([ signatureFieldDictRef, nRef, signatureImageStreamRef2 ]);

        /* start add only if texts */
        if(!_.isEmpty(info.texts)) {
            const page = pdfDoc.getPage(getFieldPage(info.fieldName, pdfDoc));
            const fontDict = page.node.lookup(PDFName.of('Resources'), PDFDict).lookup(PDFName.of('Font'), PDFDict);
            if(!fontDict.has(PDFName.of('Helvetica'))) {
                const font = pdfDoc.context.obj({
                    'Type': 'Font',
                    'Subtype': 'Type1',
                    'BaseFont': 'Helvetica',
                    'Encoding': 'WinAnsiEncoding'
                });
                const fontRef = pdfDoc.context.register(font);
                fontDict.set(PDFName.of('Helvetica'), fontRef);
                if(page.node.get(PDFName.of('Resources')) instanceof PDFRef) {
                    docSnapshot.markRefForSave(page.node.get(PDFName.of('Resources')) as PDFRef);
                } else {
                    docSnapshot.markRefForSave(page.ref);
                }
            }
        }
        /* end add only if texts */

        let incrementalPdf = Buffer.from(await pdfDoc.saveIncremental(docSnapshot));
        incrementalPdf = updateByteRange(incrementalPdf, pdf, pdfDoc.context);

        const placeholderPdf = Buffer.concat([ pdf, incrementalPdf ]);
        const pdfRanges = await getPdfRangesAsync(placeholderPdf);
        const toBeSignedBuffer = getSignBuffer(placeholderPdf, pdfRanges);
        const signature = this.computeSignature(toBeSignedBuffer, info.date || new Date());

        return embedSignature(signature, placeholderPdf, pdfRanges);
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
