import { SignDocumentBasic } from './new-sign-document-basic';
import { AlreadySignedError, InvalidImageError, NoPlaceholderError, SignatureNotFoundError } from '../errors';
import { toArrayBuffer, toBuffer } from "../helpers";

import { beginText, endText, PDFRef } from 'pdf-lib';

import { generatePdfAsync, generateAsset, generatePlaceholderPdfAsync, generateFieldPdfAsync, generateSignedTwicePdfAsync, bufferReplace } from '../../test/_helpers';
import { signDocumentBasicAssets } from '../../test/_run-assets/signer/assets-sign-document-basic';
import { signDocumentBasicRegressionAssets } from '../../test/_run-assets/signer/assets-sign-document-basic-regression';

import { expect } from 'chai';

it('_generate', async function () {
    const pdf = await generatePdfAsync({ pageCount: 2 });
    await generateAsset.generateBinaryAsync(signDocumentBasicAssets.paths.docPdf, pdf);

    const placeholderPdf = await generatePlaceholderPdfAsync(pdf);
    await generateAsset.generateBinaryAsync(signDocumentBasicAssets.paths.placeholderPdf, placeholderPdf);

    const fieldPdf = await generateFieldPdfAsync(pdf);
    await generateAsset.generateBinaryAsync(signDocumentBasicAssets.paths.fieldPdf, fieldPdf);

    const signedTwicePdf = await generateSignedTwicePdfAsync(pdf);
    await generateAsset.generateBinaryAsync(signDocumentBasicAssets.paths.signedTwicePdf, signedTwicePdf);
})

describe('SignDocumentBasic', function () {

    let signDoc: SignDocumentBasic;
    
    beforeEach(async function () {
        signDoc = await SignDocumentBasic.fromPdfAsync(signDocumentBasicAssets.docPdf);
    })

    describe('registerDict', function() {
        it('registers dict', async function() {
            signDoc.registerDict({ 'Key': 'Value' });
            const registerDictPdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicAssets.paths.registerDictPdf, registerDictPdf);
            expect(registerDictPdf).to.be.deep.equal(signDocumentBasicAssets.registerDictPdf);
        })
    })

    describe('addDict', function() {
        it('adds dict', async function() {
            signDoc.addDict({ 'Key': 'Value' });
            const addDictPdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicAssets.paths.addDictPdf, addDictPdf);
            expect(addDictPdf).to.be.deep.equal(signDocumentBasicAssets.addDictPdf);
        })
    })

    describe('addPageAnnot', function() {
        it('adds page annotation', async function() {
            signDoc.addPageAnnot(0, PDFRef.of(100));
            const addPageAnnotPdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicAssets.paths.addPageAnnotPdf, addPageAnnotPdf);
            expect(addPageAnnotPdf).to.be.deep.equal(signDocumentBasicAssets.addPageAnnotPdf);
        })
    })

    describe('addFormField', function() {
        it('adds form field', async function() {
            signDoc.addFormField(PDFRef.of(100));
            const addFormFieldPdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicAssets.paths.addFormFieldPdf, addFormFieldPdf);
            expect(addFormFieldPdf).to.be.deep.equal(signDocumentBasicAssets.addFormFieldPdf);
        })
    })

    describe('addPageContent', function() {
        it('adds page content', async function() {
            signDoc.addPageContent(0, PDFRef.of(100));
            const addPageContentPdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicAssets.paths.addPageContentPdf, addPageContentPdf);
            expect(addPageContentPdf).to.be.deep.equal(signDocumentBasicAssets.addPageContentPdf);
        })
    })

    describe('addPageResource', function() {
        it('adds page resource', async function() {
            signDoc.addPageResource(PDFRef.of(100), 0, 'background');
            const addPageResourcePdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicAssets.paths.addPageResourcePdf, addPageResourcePdf);
            expect(addPageResourcePdf).to.be.deep.equal(signDocumentBasicAssets.addPageResourcePdf);
        })
    })

    describe('registerStream', function() {
        it('registers stream', async function() {
            signDoc.registerStream([beginText(), endText()], { 'Key': 'Value' });
            const registerStreamPdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicAssets.paths.registerStreamPdf, registerStreamPdf);
            expect(registerStreamPdf).to.be.deep.equal(signDocumentBasicAssets.registerStreamPdf);
        })
    })

    describe('markObjAsChanged', function() {
        it('marks object as changed', async function() {
            signDoc.markObjAsChanged(PDFRef.of(1));
            const markObjAsChangedPdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicAssets.paths.markObjAsChangedPdf, markObjAsChangedPdf);
            expect(markObjAsChangedPdf).to.be.deep.equal(signDocumentBasicAssets.markObjAsChangedPdf);
        })
    })

    describe('saveAsync', function() {
        it('saves pdf', async function() {
            const savePdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicAssets.paths.savePdf, savePdf);
            expect(savePdf).to.be.deep.equal(signDocumentBasicAssets.savePdf);
        })
    })

    describe('getPlaceholderRanges', function() {
        it('returns signature placeholder ranges', async function() {
            signDoc = await SignDocumentBasic.fromPdfAsync(signDocumentBasicAssets.placeholderPdf);

            const placeholderRanges = signDoc.getPlaceholderRanges();

            await generateAsset.generateJsonAsync(signDocumentBasicAssets.paths.placeholderRanges, placeholderRanges);
            expect(placeholderRanges).to.be.deep.equal(signDocumentBasicAssets.placeholderRanges);
        })

        it('throws if no signature placeholder', function() {
            expect(() => signDoc.getPlaceholderRanges()).to.throw(NoPlaceholderError);
        })

        it('returns signature ranges', async function() {
            signDoc = await SignDocumentBasic.fromPdfAsync(signDocumentBasicAssets.signedTwicePdf);

            const signatureRanges = signDoc.getPlaceholderRanges();

            await generateAsset.generateJsonAsync(signDocumentBasicAssets.paths.signatureRanges, signatureRanges);
            expect(signatureRanges).to.be.deep.equal(signDocumentBasicAssets.signatureRanges);
        })
    })

    describe('ensureAcroForm', function() {
        it('ensures acro form', async function() {
            signDoc.ensureAcroForm();
            
            const acroFormPdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicAssets.paths.acroFormPdf, acroFormPdf);
            expect(acroFormPdf).to.be.deep.equal(signDocumentBasicAssets.acroFormPdf);

            signDoc.ensureAcroForm();
            
            const acroFormPdf2 = await signDoc.saveAsync();

            expect(acroFormPdf2).to.be.deep.equal(signDocumentBasicAssets.acroFormPdf);
        })
    })

    describe('ensurePageAnnots', function() {
        it('ensures page annotations', async function() {
            signDoc.ensurePageAnnots(0);
            
            const pageAnnotsPdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicAssets.paths.pageAnnotsPdf, pageAnnotsPdf);
            expect(pageAnnotsPdf).to.be.deep.equal(signDocumentBasicAssets.pageAnnotsPdf);

            signDoc.ensurePageAnnots(0);
            
            const pageAnnotsPdf2 = await signDoc.saveAsync();

            expect(pageAnnotsPdf2).to.be.deep.equal(signDocumentBasicAssets.pageAnnotsPdf);
        })

        it('ensures page annotations (page 2)', async function() {
            signDoc.ensurePageAnnots(1);
            
            const pageAnnotsPdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicAssets.paths.secondPageAnnotsPdf, pageAnnotsPdf);
            expect(pageAnnotsPdf).to.be.deep.equal(signDocumentBasicAssets.secondPageAnnotsPdf);
        })
    })

    describe('ensurePageContentsArray', function() {
        it('ensures page contents array', async function() {
            signDoc.ensurePageContentsArray(0);
            
            const pageContentsArrayPdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicAssets.paths.pageContentsArrayPdf, pageContentsArrayPdf);
            expect(pageContentsArrayPdf).to.be.deep.equal(signDocumentBasicAssets.pageContentsArrayPdf);

            signDoc.ensurePageContentsArray(0);
            
            const pageContentsArrayPdf2 = await signDoc.saveAsync();

            expect(pageContentsArrayPdf2).to.be.deep.equal(signDocumentBasicAssets.pageContentsArrayPdf);
        })

        it('ensures page contents array (page 2)', async function() {
            signDoc.ensurePageContentsArray(1);
            
            const pageContentsArrayPdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicAssets.paths.secondPageContentsArrayPdf, pageContentsArrayPdf);
            expect(pageContentsArrayPdf).to.be.deep.equal(signDocumentBasicAssets.secondPageContentsArrayPdf);
        })
    })
    
    describe('ensurePageResourcesXObject', function() {
        it('ensures page resources xobject', async function() {
            signDoc.ensurePageResourcesXObject(0);
            
            const pageResourcesXobjectPdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicAssets.paths.pageResourcesXobjectPdf, pageResourcesXobjectPdf);
            expect(pageResourcesXobjectPdf).to.be.deep.equal(signDocumentBasicAssets.pageResourcesXobjectPdf);

            signDoc.ensurePageResourcesXObject(0);
            
            const pageResourcesXobjectPdf2 = await signDoc.saveAsync();

            expect(pageResourcesXobjectPdf2).to.be.deep.equal(signDocumentBasicAssets.pageResourcesXobjectPdf);
        })

        it('ensures page resources xobject (page 2)', async function() {
            signDoc.ensurePageResourcesXObject(1);
            
            const pageResourcesXobjectPdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicAssets.paths.secondPageResourcesXobjectPdf, pageResourcesXobjectPdf);
            expect(pageResourcesXobjectPdf).to.be.deep.equal(signDocumentBasicAssets.secondPageResourcesXobjectPdf);
        })
    })

    describe('ensureSignatureFont', function() {
        it('ensures signature font', async function() {
            signDoc.ensureSignatureFont(PDFRef.of(4));
            
            const fontPdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicAssets.paths.pageFontPdf, fontPdf);
            expect(fontPdf).to.be.deep.equal(signDocumentBasicAssets.pageFontPdf);

            signDoc.ensureSignatureFont(PDFRef.of(4));
            
            const pageEmbededFontPdf2 = await signDoc.saveAsync();

            expect(pageEmbededFontPdf2).to.be.deep.equal(signDocumentBasicAssets.pageFontPdf);
        })

        it('ensures signature font (page 2)', async function() {
            signDoc.ensureSignatureFont(PDFRef.of(7));
            
            const secondPageFontPdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicAssets.paths.secondPageFontPdf, secondPageFontPdf);
            expect(secondPageFontPdf).to.be.deep.equal(signDocumentBasicAssets.secondPageFontPdf);
        })

    })

    describe('embedImageAsync', function() {
        it('embeds jpg image', async function() {
            await signDoc.embedImageAsync(signDocumentBasicAssets.jpgImage);

            const jpgImagePdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicAssets.paths.jpgImagePdf, jpgImagePdf);
            expect(jpgImagePdf).to.be.deep.equal(signDocumentBasicAssets.jpgImagePdf);
        })

        it('embeds jpg image (ArrayBuffer)', async function() {
            await signDoc.embedImageAsync(toArrayBuffer(signDocumentBasicAssets.jpgImage));

            const jpgImagePdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicAssets.paths.jpgImagePdf, jpgImagePdf);
            expect(jpgImagePdf).to.be.deep.equal(signDocumentBasicAssets.jpgImagePdf);
        })

        it('embeds jpg image (Buffer)', async function() {
            await signDoc.embedImageAsync(toBuffer(signDocumentBasicAssets.jpgImage));

            const jpgImagePdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicAssets.paths.jpgImagePdf, jpgImagePdf);
            expect(jpgImagePdf).to.be.deep.equal(signDocumentBasicAssets.jpgImagePdf);
        })

        it('embeds png image', async function() {
            await signDoc.embedImageAsync(signDocumentBasicAssets.pngImage);

            const pngImagePdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicAssets.paths.pngImagePdf, pngImagePdf);
            expect(pngImagePdf).to.be.deep.equal(signDocumentBasicAssets.pngImagePdf);
        })

        it('embeds png image (ArrayBuffer)', async function() {
            await signDoc.embedImageAsync(toArrayBuffer(signDocumentBasicAssets.pngImage));

            const pngImagePdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicAssets.paths.pngImagePdf, pngImagePdf);
            expect(pngImagePdf).to.be.deep.equal(signDocumentBasicAssets.pngImagePdf);
        })

        it('embeds png image (Buffer)', async function() {
            await signDoc.embedImageAsync(toBuffer(signDocumentBasicAssets.pngImage));

            const pngImagePdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicAssets.paths.pngImagePdf, pngImagePdf);
            expect(pngImagePdf).to.be.deep.equal(signDocumentBasicAssets.pngImagePdf);
        })

        it('throws for bad image', async function() {
            await expect(signDoc.embedImageAsync(signDocumentBasicAssets.badImage)).to.be.rejectedWith(InvalidImageError);
        })
    })

    describe('getSignatureRefss', function() {
        it('returns no signatures (no signatures)', function() {
            const signatures = signDoc.getSignatureRefs();

            expect(signatures).to.have.length(0);
        })

        it('returns signatures', async function() {
            signDoc = await SignDocumentBasic.fromPdfAsync(signDocumentBasicAssets.signedTwicePdf);

            const signatures = signDoc.getSignatureRefs();

            expect(signatures).to.have.length(2);
        })

        it('returns signatures (for placeholder)', async function() {
            signDoc = await SignDocumentBasic.fromPdfAsync(signDocumentBasicAssets.placeholderPdf);

            const signatures = signDoc.getSignatureRefs();

            expect(signatures).to.have.length(1);
        })

        it('returns signatures (for field)', async function() {
            signDoc = await SignDocumentBasic.fromPdfAsync(signDocumentBasicAssets.fieldPdf);

            const signatures = signDoc.getSignatureRefs();

            expect(signatures).to.have.length(1);
        })
    })

    describe('getSignature', function() {
        it('returns signature', async function() {
            signDoc = await SignDocumentBasic.fromPdfAsync(signDocumentBasicAssets.signedTwicePdf);

            const signature = signDoc.getSignature('Signature2');

            expect(signature).to.not.be.undefined;
        })

        it('throws for another signature', async function() {
            signDoc = await SignDocumentBasic.fromPdfAsync(signDocumentBasicAssets.signedTwicePdf);

            expect(() => signDoc.getSignature('AnotherName')).to.throw(SignatureNotFoundError);
        })
    })

    describe('getUnsignedField', function() {
        it('returns unsigned field', async function() {
            signDoc = await SignDocumentBasic.fromPdfAsync(signDocumentBasicAssets.fieldPdf);

            const signature = signDoc.getUnsignedField('Signature');

            expect(signature).to.not.be.undefined;
        })

        it('throws for already signed field', async function() {
            signDoc = await SignDocumentBasic.fromPdfAsync(signDocumentBasicAssets.signedTwicePdf);

            expect(() => signDoc.getUnsignedField('Signature2')).to.throw(AlreadySignedError);
        })
        
        it('throws for already signed field (placeholder)', async function() {
            signDoc = await SignDocumentBasic.fromPdfAsync(signDocumentBasicAssets.placeholderPdf);

            expect(() => signDoc.getUnsignedField('Signature')).to.throw(AlreadySignedError);
        })
    })

    describe('getSignaturePageNumber', function() {
        it('returns signature page', async function() {
            signDoc = await SignDocumentBasic.fromPdfAsync(signDocumentBasicAssets.signedTwicePdf);

            const signaturePage = signDoc.getSignaturePageNumber('Signature2');

            expect(signaturePage).to.be.equal(1);
        })

        it('throws for another signature', async function() {
            signDoc = await SignDocumentBasic.fromPdfAsync(signDocumentBasicAssets.signedTwicePdf);

            expect(() => signDoc.getSignaturePageNumber('AnotherName')).to.throw(SignatureNotFoundError);
        })
    })

    describe('getSignatureBuffer', function() {
        it('returns signature buffer', async function() {
            signDoc = await SignDocumentBasic.fromPdfAsync(signDocumentBasicAssets.signedTwicePdf);

            const signatures = signDoc.getSignatureRefs();

            expect(signatures).to.have.length(2);

            const signatureBuffer = signDoc.getSignatureBuffer(signatures[0]);
            await generateAsset.generateBinaryAsync(signDocumentBasicAssets.paths.signatureBuffer, signatureBuffer);
            expect(signatureBuffer).to.be.deep.equal(signDocumentBasicAssets.signatureBuffer);
        })
    })

    describe('isSignatureForEntireDocument', function() {
        it('returns true for last signature', async function() {
            signDoc = await SignDocumentBasic.fromPdfAsync(signDocumentBasicAssets.signedTwicePdf);

            const signatures = signDoc.getSignatureRefs();

            expect(signatures).to.have.length(2);

            const isForEntireDocument = signDoc.isSignatureForEntireDocument(signatures[1]);
            expect(isForEntireDocument).to.be.true;
        })

        it('returns false for first signature', async function() {
            signDoc = await SignDocumentBasic.fromPdfAsync(signDocumentBasicAssets.signedTwicePdf);

            const signatures = signDoc.getSignatureRefs();

            expect(signatures).to.have.length(2);

            const isForEntireDocument = signDoc.isSignatureForEntireDocument(signatures[0]);
            expect(isForEntireDocument).to.be.false;
        })
    })

    describe('getSignatureCount', function() {
        it('returns signature count', async function() {
            signDoc = await SignDocumentBasic.fromPdfAsync(signDocumentBasicAssets.signedTwicePdf);

            const signatureCount = signDoc.getSignatureCount();

            expect(signatureCount).to.be.equal(2);
        })

        it('returns signature count (no signature)', function() {
            const signatureCount = signDoc.getSignatureCount();

            expect(signatureCount).to.be.equal(0);
        })

        it('returns signature count (placeholder)', async function() {
            signDoc = await SignDocumentBasic.fromPdfAsync(signDocumentBasicAssets.placeholderPdf);

            const signatureCount = signDoc.getSignatureCount();

            expect(signatureCount).to.be.equal(1);
        })

        it('returns signature count (field)', async function() {
            signDoc = await SignDocumentBasic.fromPdfAsync(signDocumentBasicAssets.fieldPdf);

            const signatureCount = signDoc.getSignatureCount();

            expect(signatureCount).to.be.equal(1);
        })
    })

    describe('getFields', function() {
        it('returns no fileds (no fields)', function() {
            const signatures = signDoc.getFields();

            expect(signatures).to.have.length(0);
        })

        it('returns no fields (signed)', async function() {
            signDoc = await SignDocumentBasic.fromPdfAsync(signDocumentBasicAssets.signedTwicePdf);

            const signatures = signDoc.getFields();

            expect(signatures).to.have.length(0);
        })

        it('returns no fields (for placeholder)', async function() {
            signDoc = await SignDocumentBasic.fromPdfAsync(signDocumentBasicAssets.placeholderPdf);

            const signatures = signDoc.getFields();

            expect(signatures).to.have.length(0);
        })

        it('returns fields (for field)', async function() {
            signDoc = await SignDocumentBasic.fromPdfAsync(signDocumentBasicAssets.fieldPdf);

            const signatures = signDoc.getFields();

            expect(signatures).to.have.length(1);
        })
    })
})

describe("SignDocumentBasic Regression", function () {
    let signDoc: SignDocumentBasic;
    
    beforeEach(async function () {
        signDoc = await SignDocumentBasic.fromPdfAsync(signDocumentBasicRegressionAssets.blankPdf);
    })

    describe('ensureAcroForm', function() {
        it('ensures acro form', async function() {
            signDoc.ensureAcroForm();
            
            const acroFormPdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicRegressionAssets.paths.acroFormPdf, acroFormPdf);
            expect(acroFormPdf).to.be.deep.equal(signDocumentBasicRegressionAssets.acroFormPdf);

            signDoc.ensureAcroForm();
            
            const acroFormPdf2 = await signDoc.saveAsync();

            expect(acroFormPdf2).to.be.deep.equal(signDocumentBasicRegressionAssets.acroFormPdf);
        })
    })

    describe('ensurePageAnnots', function() {
        it('ensures page annotations', async function() {
            signDoc.ensurePageAnnots(0);
            
            const pageAnnotsPdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicRegressionAssets.paths.pageAnnotsPdf, pageAnnotsPdf);
            expect(pageAnnotsPdf).to.be.deep.equal(signDocumentBasicRegressionAssets.pageAnnotsPdf);

            signDoc.ensurePageAnnots(0);
            
            const pageAnnotsPdf2 = await signDoc.saveAsync();

            expect(pageAnnotsPdf2).to.be.deep.equal(signDocumentBasicRegressionAssets.pageAnnotsPdf);
        })

        it('ensures page annotations (page 2)', async function() {
            signDoc.ensurePageAnnots(1);
            
            const pageAnnotsPdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicRegressionAssets.paths.secondPageAnnotsPdf, pageAnnotsPdf);
            expect(pageAnnotsPdf).to.be.deep.equal(signDocumentBasicRegressionAssets.secondPageAnnotsPdf);
        })
    })

    describe('ensurePageContentsArray', function() {
        it('ensures page contents array', async function() {
            signDoc.ensurePageContentsArray(0);
            
            const pageContentsArrayPdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicRegressionAssets.paths.pageContentsArrayPdf, pageContentsArrayPdf);
            expect(pageContentsArrayPdf).to.be.deep.equal(signDocumentBasicRegressionAssets.pageContentsArrayPdf);

            signDoc.ensurePageContentsArray(0);
            
            const pageContentsArrayPdf2 = await signDoc.saveAsync();

            expect(pageContentsArrayPdf2).to.be.deep.equal(signDocumentBasicRegressionAssets.pageContentsArrayPdf);
        })

        it('ensures page contents array (page 2)', async function() {
            signDoc.ensurePageContentsArray(1);
            
            const pageContentsArrayPdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicRegressionAssets.paths.secondPageContentsArrayPdf, pageContentsArrayPdf);
            expect(pageContentsArrayPdf).to.be.deep.equal(signDocumentBasicRegressionAssets.secondPageContentsArrayPdf);
        })
    })
    
    describe('ensurePageResourcesXObject', function() {
        it('ensures page resources xobject', async function() {
            signDoc.ensurePageResourcesXObject(0);
            
            const pageResourcesXobjectPdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicRegressionAssets.paths.pageResourcesXobjectPdf, pageResourcesXobjectPdf);
            expect(pageResourcesXobjectPdf).to.be.deep.equal(signDocumentBasicRegressionAssets.pageResourcesXobjectPdf);

            signDoc.ensurePageResourcesXObject(0);
            
            const pageResourcesXobjectPdf2 = await signDoc.saveAsync();

            expect(pageResourcesXobjectPdf2).to.be.deep.equal(signDocumentBasicRegressionAssets.pageResourcesXobjectPdf);
        })

        it('ensures page resources xobject (page 2)', async function() {
            signDoc.ensurePageResourcesXObject(1);
            
            const pageResourcesXobjectPdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicRegressionAssets.paths.secondPageResourcesXobjectPdf, pageResourcesXobjectPdf);
            expect(pageResourcesXobjectPdf).to.be.deep.equal(signDocumentBasicRegressionAssets.secondPageResourcesXobjectPdf);
        })
    })

    describe('ensureSignatureFont', function() {
        it('ensures signature font', async function() {
            signDoc.ensureSignatureFont(PDFRef.of(4));
            
            const fontPdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicRegressionAssets.paths.pageFontPdf, fontPdf);
            expect(fontPdf).to.be.deep.equal(signDocumentBasicRegressionAssets.pageFontPdf);

            signDoc.ensureSignatureFont(PDFRef.of(4));
            
            const pageEmbededFontPdf2 = await signDoc.saveAsync();

            expect(pageEmbededFontPdf2).to.be.deep.equal(signDocumentBasicRegressionAssets.pageFontPdf);
        })

        it('ensures signature font (page 2)', async function() {
            signDoc.ensureSignatureFont(PDFRef.of(7));
            
            const secondPageFontPdf = await signDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signDocumentBasicRegressionAssets.paths.secondPageFontPdf, secondPageFontPdf);
            expect(secondPageFontPdf).to.be.deep.equal(signDocumentBasicRegressionAssets.secondPageFontPdf);
        })

    })
});
