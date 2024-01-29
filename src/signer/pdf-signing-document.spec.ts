import { PdfSigningDocument } from './pdf-signing-document';
import { InvalidImageError, NoPlaceholderError, SignatureNotFoundError } from '../errors';

import { generatePdfAsync, generateAsset, generatePlaceholderPdfAsync, generateFieldPdfAsync, generateSignedTwicePdfAsync } from '../../test/_helpers';
import { signingDocumentAssets } from '../../test/_run-assets/signer/assets-pdf-signing-document';

import { expect } from 'chai';
import { PDFRef } from 'pdf-lib';

it('_generate', async function () {
    const pdf = await generatePdfAsync({ pageCount: 2 });
    await generateAsset.generateBinaryAsync(signingDocumentAssets.paths.pdf, pdf);

    const placeholderPdf = await generatePlaceholderPdfAsync(pdf);
    await generateAsset.generateBinaryAsync(signingDocumentAssets.paths.placeholderPdf, placeholderPdf);

    const fieldPdf = await generateFieldPdfAsync(pdf);
    await generateAsset.generateBinaryAsync(signingDocumentAssets.paths.fieldPdf, fieldPdf);

    const signedTwicePdf = await generateSignedTwicePdfAsync(pdf);
    await generateAsset.generateBinaryAsync(signingDocumentAssets.paths.signedTwicePdf, signedTwicePdf);
})

describe('PdfSigningDocument', function () {

    let signingDoc: PdfSigningDocument;
    
    beforeEach(async function () {
        signingDoc = await PdfSigningDocument.fromPdfAsync(signingDocumentAssets.pdf);
    })

    describe('registerDict', function() {
        it('registers dict', async function() {
            signingDoc.registerDict({ 'Key': 'Value' });
            const registerDictPdf = await signingDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingDocumentAssets.paths.registerDictPdf, registerDictPdf);
            expect(registerDictPdf).to.be.deep.equal(signingDocumentAssets.registerDictPdf);
        })
    })

    describe('addDict', function() {
        it('adds dict', async function() {
            signingDoc.addDict({ 'Key': 'Value' });
            const addDictPdf = await signingDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingDocumentAssets.paths.addDictPdf, addDictPdf);
            expect(addDictPdf).to.be.deep.equal(signingDocumentAssets.addDictPdf);
        })
    })

    describe('addPageAnnot', function() {
        it('adds page annotation', async function() {
            signingDoc.addPageAnnot(0, PDFRef.of(100));
            const addPageAnnotPdf = await signingDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingDocumentAssets.paths.addPageAnnotPdf, addPageAnnotPdf);
            expect(addPageAnnotPdf).to.be.deep.equal(signingDocumentAssets.addPageAnnotPdf);
        })
    })

    describe('addFormField', function() {
        it('adds form field', async function() {
            signingDoc.addFormField(PDFRef.of(100));
            const addFormFieldPdf = await signingDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingDocumentAssets.paths.addFormFieldPdf, addFormFieldPdf);
            expect(addFormFieldPdf).to.be.deep.equal(signingDocumentAssets.addFormFieldPdf);
        })
    })

    describe('addPageContent', function() {
        it('adds page content', async function() {
            signingDoc.addPageContent(PDFRef.of(100), 0);
            const addPageContentPdf = await signingDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingDocumentAssets.paths.addPageContentPdf, addPageContentPdf);
            expect(addPageContentPdf).to.be.deep.equal(signingDocumentAssets.addPageContentPdf);
        })
    })

    describe('addPageResource', function() {
        it('adds page resource', async function() {
            signingDoc.addPageResource(PDFRef.of(100), 0, 'background');
            const addPageResourcePdf = await signingDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingDocumentAssets.paths.addPageResourcePdf, addPageResourcePdf);
            expect(addPageResourcePdf).to.be.deep.equal(signingDocumentAssets.addPageResourcePdf);
        })
    })

    describe('registerStream', function() {
        it('registers stream', async function() {
            signingDoc.registerStream('q Q', { 'Key': 'Value' });
            const registerStreamPdf = await signingDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingDocumentAssets.paths.registerStreamPdf, registerStreamPdf);
            expect(registerStreamPdf).to.be.deep.equal(signingDocumentAssets.registerStreamPdf);
        })
    })

    describe('markObjAsChanged', function() {
        it('marks object as changed', async function() {
            signingDoc.markObjAsChanged(PDFRef.of(1));
            const markObjAsChangedPdf = await signingDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingDocumentAssets.paths.markObjAsChangedPdf, markObjAsChangedPdf);
            expect(markObjAsChangedPdf).to.be.deep.equal(signingDocumentAssets.markObjAsChangedPdf);
        })
    })

    describe('saveAsync', function() {
        it('saves pdf', async function() {
            const savePdf = await signingDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingDocumentAssets.paths.savePdf, savePdf);
            expect(savePdf).to.be.deep.equal(signingDocumentAssets.savePdf);
        })
    })

    describe('getPlaceholderRanges', function() {
        it('returns signature placeholder ranges', async function() {
            signingDoc = await PdfSigningDocument.fromPdfAsync(signingDocumentAssets.placeholderPdf);

            const placeholderRanges = signingDoc.getPlaceholderRanges();

            await generateAsset.generateJsonAsync(signingDocumentAssets.paths.placeholderRanges, placeholderRanges);
            expect(placeholderRanges).to.be.deep.equal(signingDocumentAssets.placeholderRanges);
        })

        it('throws if no signature placeholder', async function() {
            expect(() => signingDoc.getPlaceholderRanges()).to.throw(NoPlaceholderError);
        })

        it('returns signature ranges', async function() {
            signingDoc = await PdfSigningDocument.fromPdfAsync(signingDocumentAssets.signedTwicePdf);

            const signatureRanges = signingDoc.getPlaceholderRanges();

            await generateAsset.generateJsonAsync(signingDocumentAssets.paths.signatureRanges, signatureRanges);
            expect(signatureRanges).to.be.deep.equal(signingDocumentAssets.signatureRanges);
        })
    })

    describe('ensureAcroForm', function() {
        it('ensures acro form', async function() {
            signingDoc.ensureAcroForm();
            
            const acroFormPdf = await signingDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingDocumentAssets.paths.acroFormPdf, acroFormPdf);
            expect(acroFormPdf).to.be.deep.equal(signingDocumentAssets.acroFormPdf);

            signingDoc.ensureAcroForm();
            
            const acroFormPdf2 = await signingDoc.saveAsync();

            expect(acroFormPdf2).to.be.deep.equal(signingDocumentAssets.acroFormPdf);
        })
    })

    describe('ensurePageAnnots', function() {
        it('ensures page annotations', async function() {
            signingDoc.ensurePageAnnots(0);
            
            const pageAnnotsPdf = await signingDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingDocumentAssets.paths.pageAnnotsPdf, pageAnnotsPdf);
            expect(pageAnnotsPdf).to.be.deep.equal(signingDocumentAssets.pageAnnotsPdf);

            signingDoc.ensurePageAnnots(0);
            
            const pageAnnotsPdf2 = await signingDoc.saveAsync();

            expect(pageAnnotsPdf2).to.be.deep.equal(signingDocumentAssets.pageAnnotsPdf);
        })

        it('ensures page annotations (page 2)', async function() {
            signingDoc.ensurePageAnnots(1);
            
            const pageAnnotsPdf = await signingDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingDocumentAssets.paths.secondPageAnnotsPdf, pageAnnotsPdf);
            expect(pageAnnotsPdf).to.be.deep.equal(signingDocumentAssets.secondPageAnnotsPdf);
        })
    })

    describe('ensurePageContentsArray', function() {
        it('ensures page contents array', async function() {
            signingDoc.ensurePageContentsArray(0);
            
            const pageContentsArrayPdf = await signingDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingDocumentAssets.paths.pageContentsArrayPdf, pageContentsArrayPdf);
            expect(pageContentsArrayPdf).to.be.deep.equal(signingDocumentAssets.pageContentsArrayPdf);

            signingDoc.ensurePageContentsArray(0);
            
            const pageContentsArrayPdf2 = await signingDoc.saveAsync();

            expect(pageContentsArrayPdf2).to.be.deep.equal(signingDocumentAssets.pageContentsArrayPdf);
        })

        it('ensures page contents array (page 2)', async function() {
            signingDoc.ensurePageContentsArray(1);
            
            const pageContentsArrayPdf = await signingDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingDocumentAssets.paths.secondPageContentsArrayPdf, pageContentsArrayPdf);
            expect(pageContentsArrayPdf).to.be.deep.equal(signingDocumentAssets.secondPageContentsArrayPdf);
        })
    })
    
    describe('ensurePageResourcesXObject', function() {
        it('ensures page resources xobject', async function() {
            signingDoc.ensurePageResourcesXObject(0);
            
            const pageResourcesXobjectPdf = await signingDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingDocumentAssets.paths.pageResourcesXobjectPdf, pageResourcesXobjectPdf);
            expect(pageResourcesXobjectPdf).to.be.deep.equal(signingDocumentAssets.pageResourcesXobjectPdf);

            signingDoc.ensurePageResourcesXObject(0);
            
            const pageResourcesXobjectPdf2 = await signingDoc.saveAsync();

            expect(pageResourcesXobjectPdf2).to.be.deep.equal(signingDocumentAssets.pageResourcesXobjectPdf);
        })

        it('ensures page resources xobject (page 2)', async function() {
            signingDoc.ensurePageResourcesXObject(1);
            
            const pageResourcesXobjectPdf = await signingDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingDocumentAssets.paths.secondPageResourcesXobjectPdf, pageResourcesXobjectPdf);
            expect(pageResourcesXobjectPdf).to.be.deep.equal(signingDocumentAssets.secondPageResourcesXobjectPdf);
        })
    })

    describe('embedImageAsync', function() {
        it('embeds jpg image', async function() {
            await signingDoc.embedImageAsync(signingDocumentAssets.jpgImage);

            const jpgImagePdf = await signingDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingDocumentAssets.paths.jpgImagePdf, jpgImagePdf);
            expect(jpgImagePdf).to.be.deep.equal(signingDocumentAssets.jpgImagePdf);
        })

        it('embeds png image', async function() {
            await signingDoc.embedImageAsync(signingDocumentAssets.pngImage);

            const pngImagePdf = await signingDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingDocumentAssets.paths.pngImagePdf, pngImagePdf);
            expect(pngImagePdf).to.be.deep.equal(signingDocumentAssets.pngImagePdf);
        })

        it('throws for bad image', async function() {
            await expect(signingDoc.embedImageAsync(signingDocumentAssets.badImage)).to.be.rejectedWith(InvalidImageError);
        })
    })

    describe('getSignatures', function() {
        it('returns no signatures (no signatures)', async function() {
            const signatures = await signingDoc.getSignatures();

            expect(signatures).to.have.length(0);
        })

        it('returns signatures', async function() {
            signingDoc = await PdfSigningDocument.fromPdfAsync(signingDocumentAssets.signedTwicePdf);

            const signatures = await signingDoc.getSignatures();

            expect(signatures).to.have.length(2);
        })

        it('returns signatures (for placeholder)', async function() {
            signingDoc = await PdfSigningDocument.fromPdfAsync(signingDocumentAssets.placeholderPdf);

            const signatures = await signingDoc.getSignatures();

            expect(signatures).to.have.length(1);
        })

        it('returns signatures (for field)', async function() {
            signingDoc = await PdfSigningDocument.fromPdfAsync(signingDocumentAssets.fieldPdf);

            const signatures = await signingDoc.getSignatures();

            expect(signatures).to.have.length(1);
        })
    })

    describe('getSignature', function() {
        it('returns signature', async function() {
            signingDoc = await PdfSigningDocument.fromPdfAsync(signingDocumentAssets.signedTwicePdf);

            const signature = await signingDoc.getSignature('Signature2');

            expect(signature).to.not.be.undefined;
        })

        it('throws for another signature', async function() {
            signingDoc = await PdfSigningDocument.fromPdfAsync(signingDocumentAssets.signedTwicePdf);

            expect(() => signingDoc.getSignature('AnotherName')).to.throw(SignatureNotFoundError);
        })
    })

    describe('getSignaturePageNumber', function() {
        it('returns signature page', async function() {
            signingDoc = await PdfSigningDocument.fromPdfAsync(signingDocumentAssets.signedTwicePdf);

            const signaturePage = await signingDoc.getSignaturePageNumber('Signature2');

            expect(signaturePage).to.be.equal(1);
        })

        it('throws for another signature', async function() {
            signingDoc = await PdfSigningDocument.fromPdfAsync(signingDocumentAssets.signedTwicePdf);

            expect(() => signingDoc.getSignaturePageNumber('AnotherName')).to.throw(SignatureNotFoundError);
        })
    })

    describe('getSignatureBuffer', function() {
        it('returns signature buffer', async function() {
            signingDoc = await PdfSigningDocument.fromPdfAsync(signingDocumentAssets.signedTwicePdf);

            const signatures = signingDoc.getSignatures();

            expect(signatures).to.have.length(2);

            const signatureBuffer = await signingDoc.getSignatureBuffer(signatures[0]);
            await generateAsset.generateBinaryAsync(signingDocumentAssets.paths.signatureBuffer, signatureBuffer);
            expect(signatureBuffer).to.be.deep.equal(signingDocumentAssets.signatureBuffer);
        })
    })

    describe('getSignatureHexString', function() {
        it('returns signature hex string', async function() {
            signingDoc = await PdfSigningDocument.fromPdfAsync(signingDocumentAssets.signedTwicePdf);

            const signatures = signingDoc.getSignatures();

            expect(signatures).to.have.length(2);

            const signatureHexString = await signingDoc.getSignatureHexString(signatures[0]);
            await generateAsset.generateTextAsync(signingDocumentAssets.paths.signatureHexString, signatureHexString);
            expect(signatureHexString).to.be.deep.equal(signingDocumentAssets.signatureHexString);
        })
    })

    describe('isSignatureForEntireDocument', function() {
        it('returns true for last signature', async function() {
            signingDoc = await PdfSigningDocument.fromPdfAsync(signingDocumentAssets.signedTwicePdf);

            const signatures = signingDoc.getSignatures();

            expect(signatures).to.have.length(2);

            const isForEntireDocument = await signingDoc.isSignatureForEntireDocument(signatures[1]);
            expect(isForEntireDocument).to.be.true;
        })

        it('returns false for first signature', async function() {
            signingDoc = await PdfSigningDocument.fromPdfAsync(signingDocumentAssets.signedTwicePdf);

            const signatures = signingDoc.getSignatures();

            expect(signatures).to.have.length(2);

            const isForEntireDocument = await signingDoc.isSignatureForEntireDocument(signatures[0]);
            expect(isForEntireDocument).to.be.false;
        })
    })

    describe('getSignatureCount', function() {
        it('returns signature count', async function() {
            signingDoc = await PdfSigningDocument.fromPdfAsync(signingDocumentAssets.signedTwicePdf);

            const signatureCount = await signingDoc.getSignatureCount();

            expect(signatureCount).to.be.equal(2);
        })

        it('returns signature count (no signature)', async function() {
            const signatureCount = await signingDoc.getSignatureCount();

            expect(signatureCount).to.be.equal(0);
        })

        it('returns signature count (placeholder)', async function() {
            signingDoc = await PdfSigningDocument.fromPdfAsync(signingDocumentAssets.placeholderPdf);

            const signatureCount = await signingDoc.getSignatureCount();

            expect(signatureCount).to.be.equal(1);
        })

        it('returns signature count (field)', async function() {
            signingDoc = await PdfSigningDocument.fromPdfAsync(signingDocumentAssets.fieldPdf);

            const signatureCount = await signingDoc.getSignatureCount();

            expect(signatureCount).to.be.equal(1);
        })
    })

    describe('getFields', function() {
        it('returns no fileds (no fields)', async function() {
            const signatures = await signingDoc.getFields();

            expect(signatures).to.have.length(0);
        })

        it('returns no fields (signed)', async function() {
            signingDoc = await PdfSigningDocument.fromPdfAsync(signingDocumentAssets.signedTwicePdf);

            const signatures = await signingDoc.getFields();

            expect(signatures).to.have.length(0);
        })

        it('returns no fields (for placeholder)', async function() {
            signingDoc = await PdfSigningDocument.fromPdfAsync(signingDocumentAssets.placeholderPdf);

            const signatures = await signingDoc.getFields();

            expect(signatures).to.have.length(0);
        })

        it('returns fields (for field)', async function() {
            signingDoc = await PdfSigningDocument.fromPdfAsync(signingDocumentAssets.fieldPdf);

            const signatures = await signingDoc.getFields();

            expect(signatures).to.have.length(1);
        })
    })

    describe('embedSignatureFont', function() {
        it('embeds signature font', async function() {
            signingDoc.embedSignatureFont(0);
            
            const pageEmbededFontPdf = await signingDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingDocumentAssets.paths.pageEmbededFontPdf, pageEmbededFontPdf);
            expect(pageEmbededFontPdf).to.be.deep.equal(signingDocumentAssets.pageEmbededFontPdf);

            signingDoc.embedSignatureFont(0);
            
            const pageEmbededFontPdf2 = await signingDoc.saveAsync();

            expect(pageEmbededFontPdf2).to.be.deep.equal(signingDocumentAssets.pageEmbededFontPdf);
        })

        it('embeds signature font (page 2)', async function() {
            signingDoc.embedSignatureFont(1);
            
            const pageEmbededFontPdf = await signingDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingDocumentAssets.paths.secondPageEmbededFontPdf, pageEmbededFontPdf);
            expect(pageEmbededFontPdf).to.be.deep.equal(signingDocumentAssets.secondPageEmbededFontPdf);
        })

    })
})