import { AddSignatureFieldParameters, AddSignaturePlaceholderParameters, AddVisualParameters, SigningPdfDocument, UpdateSignatureParameters } from './signing-pdf-document';
import { NoPlaceholderError, SignatureNotFoundError } from './errors';
import { SignerSettings } from './models/settings';
import { PdfSigner } from './pdf-signer';

import { generatePdfAsync } from '../test/_helpers/pdf-helpers';
import { generateAsset } from '../test/_helpers/generate-asset';
import { signingAssets } from '../test/_run-assets/signing-pdf-document/assets-signing';
import { settingsAssets } from '../test/_run-assets/signature-computer/assets-settings';

import { expect } from 'chai';
import { PDFRef } from 'pdf-lib';

describe.only('SigningPdfDocument', function () {

    let signingPdfDoc: SigningPdfDocument;
    let addFieldParameters: AddSignatureFieldParameters;
    let addVisualParameters: AddVisualParameters;
    let addPlaceholderParameters: AddSignaturePlaceholderParameters;
    let updateParameters: UpdateSignatureParameters;
    
    beforeEach(async function () {
        addFieldParameters = {
            name: 'Signature',
            pageIndex: 0,
            rectangle: { 
                left: 50, 
                top: 100, 
                right: 50 + 214, 
                bottom: 100 + 70
            }, 
            visualRef: PDFRef.of(170),
            placeholderRef: PDFRef.of(171),
            embedFont: true
        };
        addVisualParameters = { 
            background: signingAssets.visual, 
            texts: [
                {
                    lines: [ 
                        'JOHN', 
                        'DOE'
                    ]
                }, {
                    lines: [ 
                        'Digitally signed by', 
                        'JOHN DOE', 
                        'Date: 2023.11.03', 
                        '20:28:46 +02\'00\''
                    ]
                }
            ]
        };
        addPlaceholderParameters = {
            name: 'Test Signer',
            location: 'Timisoara',
            reason: 'Signing',
            date: new Date(2023, 1, 20, 18, 47, 35), 
            contactInfo: 'signer@semnezonline.ro',

            signaturePlaceholder: 'A'.repeat(4096),
            rangePlaceHolder: 9999
        };
        updateParameters = {
            placeholderRef: PDFRef.of(180),
            visualRef: PDFRef.of(181),
            embedFont: true
        };
        signingPdfDoc = await SigningPdfDocument.fromPdfAsync(signingAssets.pdf);
    })

    it('_generate', async function () {
        const signerSettings: SignerSettings = {
            signatureLength: 4096,
            rangePlaceHolder: 99999,
            signatureComputer: {
                certificate: settingsAssets.p12Certificate,
                password: 'password'        
            }
        }
        const pdfSigner = new PdfSigner(signerSettings);
        const signDate: Date = new Date(2023, 1, 20, 18, 47, 35);


        const pdf = await generatePdfAsync({ pageCount: 2 });
        await generateAsset.generateBinaryAsync(signingAssets.paths.pdf, pdf);

        const placeholderPdf = await pdfSigner.addPlaceholderAsync(pdf, { pageNumber: 1, name: 'Signature', signature: { date: signDate } });
        await generateAsset.generateBinaryAsync(signingAssets.paths.realPlaceholderPdf, placeholderPdf);

        const fieldPdf = await pdfSigner.addFieldAsync(pdf, { pageNumber: 1, name: 'Signature', rectangle: { left: 50, top: 100, right: 50 + 214, bottom: 100 + 70 } });
        await generateAsset.generateBinaryAsync(signingAssets.paths.realFieldPdf, fieldPdf);
    })

    describe('addSignatureField', function() {
        it('adds signature field', async function() {
            signingPdfDoc.addSignatureField(addFieldParameters);
            const fieldPdf = await signingPdfDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingAssets.paths.fieldPdf, fieldPdf);
            expect(fieldPdf).to.be.deep.equal(signingAssets.fieldPdf);
        })

        it('adds signature field (no name)', async function() {
            delete addFieldParameters.name;

            signingPdfDoc.addSignatureField(addFieldParameters);
            const noNameFieldPdf = await signingPdfDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingAssets.paths.noNameFieldPdf, noNameFieldPdf);
            expect(noNameFieldPdf).to.be.deep.equal(signingAssets.noNameFieldPdf);
        })

        it('adds signature field (no rectangle)', async function() {
            delete addFieldParameters.rectangle;

            signingPdfDoc.addSignatureField(addFieldParameters);
            const noRectangleFieldPdf = await signingPdfDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingAssets.paths.noRectangleFieldPdf, noRectangleFieldPdf);
            expect(noRectangleFieldPdf).to.be.deep.equal(signingAssets.noRectangleFieldPdf);
        })

        it('adds signature field (no visual ref)', async function() {
            delete addFieldParameters.visualRef;

            signingPdfDoc.addSignatureField(addFieldParameters);
            const noVisualRefFieldPdf = await signingPdfDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingAssets.paths.noVisualRefFieldPdf, noVisualRefFieldPdf);
            expect(noVisualRefFieldPdf).to.be.deep.equal(signingAssets.noVisualRefFieldPdf);
        })

        it('adds signature field (no placeholder ref)', async function() {
            delete addFieldParameters.placeholderRef;

            signingPdfDoc.addSignatureField(addFieldParameters);
            const noPlaceholderRefFieldPdf = await signingPdfDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingAssets.paths.noPlaceholderRefFieldPdf, noPlaceholderRefFieldPdf);
            expect(noPlaceholderRefFieldPdf).to.be.deep.equal(signingAssets.noPlaceholderRefFieldPdf);
        })

        it('adds signature field (no font)', async function() {
            addFieldParameters.embedFont = false;

            signingPdfDoc.addSignatureField(addFieldParameters);
            const noFontFieldPdf = await signingPdfDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingAssets.paths.noFontFieldPdf, noFontFieldPdf);
            expect(noFontFieldPdf).to.be.deep.equal(signingAssets.noFontFieldPdf);
        })

        it('adds signature field (no optionals)', async function() {
            delete addFieldParameters.name;
            delete addFieldParameters.rectangle;
            delete addFieldParameters.visualRef;
            delete addFieldParameters.placeholderRef;

            signingPdfDoc.addSignatureField(addFieldParameters);
            const noOptionalsFieldPdf = await signingPdfDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingAssets.paths.noOptionalsFieldPdf, noOptionalsFieldPdf);
            expect(noOptionalsFieldPdf).to.be.deep.equal(signingAssets.noOptionalsFieldPdf);
        })

        it('adds signature field (page two)', async function() {
            addFieldParameters.pageIndex = 1;

            signingPdfDoc.addSignatureField(addFieldParameters);
            const pageTwoFieldPdf = await signingPdfDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingAssets.paths.pageTwoFieldPdf, pageTwoFieldPdf);
            expect(pageTwoFieldPdf).to.be.deep.equal(signingAssets.pageTwoFieldPdf);
        })
    })

    describe('addVisualAsync', function() {
        it('adds visual', async function() {
            const visualRef = await signingPdfDoc.addVisualAsync(addVisualParameters);
            const visualPdf = await signingPdfDoc.saveAsync();

            expect(visualRef).to.not.be.undefined;
            await generateAsset.generateBinaryAsync(signingAssets.paths.visualPdf, visualPdf);
            expect(visualPdf).to.be.deep.equal(signingAssets.visualPdf);
        })

        it('adds visual (no background)', async function() {
            delete addVisualParameters.background;

            const visualRef = await signingPdfDoc.addVisualAsync(addVisualParameters);
            const noBackgroundVisualPdf = await signingPdfDoc.saveAsync();

            expect(visualRef).to.not.be.undefined;
            await generateAsset.generateBinaryAsync(signingAssets.paths.noBackgroundVisualPdf, noBackgroundVisualPdf);
            expect(noBackgroundVisualPdf).to.be.deep.equal(signingAssets.noBackgroundVisualPdf);
        })

        it('adds visual (no texts)', async function() {
            delete addVisualParameters.texts;
            
            const visualRef = await signingPdfDoc.addVisualAsync(addVisualParameters);
            const noTextsVisualPdf = await signingPdfDoc.saveAsync();

            expect(visualRef).to.not.be.undefined;
            await generateAsset.generateBinaryAsync(signingAssets.paths.noTextsVisualPdf, noTextsVisualPdf);
            expect(noTextsVisualPdf).to.be.deep.equal(signingAssets.noTextsVisualPdf);
        })

        it('adds visual (no optionals)', async function() {
            delete addVisualParameters.background;
            delete addVisualParameters.texts;
            
            const visualRef = await signingPdfDoc.addVisualAsync(addVisualParameters);
            const noOptionalsVisualPdf = await signingPdfDoc.saveAsync();

            expect(visualRef).to.be.undefined;
            await generateAsset.generateBinaryAsync(signingAssets.paths.noOptionalsVisualPdf, noOptionalsVisualPdf);
            expect(noOptionalsVisualPdf).to.be.deep.equal(signingAssets.noOptionalsVisualPdf);
        })
    })

    describe('addEmptyVisual', function() {
        it('adds empty visual', async function() {
            signingPdfDoc.addEmptyVisual();
            const emptyVisualPdf = await signingPdfDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingAssets.paths.emptyVisualPdf, emptyVisualPdf);
            expect(emptyVisualPdf).to.be.deep.equal(signingAssets.emptyVisualPdf);
        })
    })

    describe('addSignaturePlaceholder', function() {
        it('adds placeholder', async function() {
            const placeholderRef = await signingPdfDoc.addVisualAsync(addVisualParameters);
            const placeholderPdf = await signingPdfDoc.saveAsync();

            expect(placeholderRef).to.not.be.undefined;
            await generateAsset.generateBinaryAsync(signingAssets.paths.placeholderPdf, placeholderPdf);
            expect(placeholderPdf).to.be.deep.equal(signingAssets.placeholderPdf);
        })

        it('adds placeholder (no name)', async function() {
            delete addPlaceholderParameters.name;

            const placeholderRef = await signingPdfDoc.addVisualAsync(addVisualParameters);
            const noNamePlaceholderPdf = await signingPdfDoc.saveAsync();

            expect(placeholderRef).to.not.be.undefined;
            await generateAsset.generateBinaryAsync(signingAssets.paths.noNamePlaceholderPdf, noNamePlaceholderPdf);
            expect(noNamePlaceholderPdf).to.be.deep.equal(signingAssets.noNamePlaceholderPdf);
        })

        it('adds placeholder (no reason)', async function() {
            delete addPlaceholderParameters.reason;
            
            const placeholderRef = await signingPdfDoc.addVisualAsync(addVisualParameters);
            const noReasonPlaceholderPdf = await signingPdfDoc.saveAsync();

            expect(placeholderRef).to.not.be.undefined;
            await generateAsset.generateBinaryAsync(signingAssets.paths.noReasonPlaceholderPdf, noReasonPlaceholderPdf);
            expect(noReasonPlaceholderPdf).to.be.deep.equal(signingAssets.noReasonPlaceholderPdf);
        })

        it('adds placeholder (no location)', async function() {
            delete addPlaceholderParameters.location;
            
            const placeholderRef = await signingPdfDoc.addVisualAsync(addVisualParameters);
            const noLocationPlaceholderPdf = await signingPdfDoc.saveAsync();

            expect(placeholderRef).to.not.be.undefined;
            await generateAsset.generateBinaryAsync(signingAssets.paths.noLocationPlaceholderPdf, noLocationPlaceholderPdf);
            expect(noLocationPlaceholderPdf).to.be.deep.equal(signingAssets.noLocationPlaceholderPdf);
        })

        it('adds placeholder (no contact info)', async function() {
            delete addPlaceholderParameters.contactInfo;
            
            const placeholderRef = await signingPdfDoc.addVisualAsync(addVisualParameters);
            const noContactInfoPlaceholderPdf = await signingPdfDoc.saveAsync();

            expect(placeholderRef).to.not.be.undefined;
            await generateAsset.generateBinaryAsync(signingAssets.paths.noContactInfoPlaceholderPdf, noContactInfoPlaceholderPdf);
            expect(noContactInfoPlaceholderPdf).to.be.deep.equal(signingAssets.noContactInfoPlaceholderPdf);
        })

        it('adds placeholder (no date)', async function() {
            delete addPlaceholderParameters.date;
            
            const placeholderRef = await signingPdfDoc.addVisualAsync(addVisualParameters);
            const noDatePlaceholderPdf = await signingPdfDoc.saveAsync();

            expect(placeholderRef).to.not.be.undefined;
            await generateAsset.generateBinaryAsync(signingAssets.paths.noDatePlaceholderPdf, noDatePlaceholderPdf);
            expect(noDatePlaceholderPdf).to.be.deep.equal(signingAssets.noDatePlaceholderPdf);
        })

        it('adds placeholder (no optionals)', async function() {
            delete addPlaceholderParameters.name;
            delete addPlaceholderParameters.reason;
            delete addPlaceholderParameters.location;
            delete addPlaceholderParameters.contactInfo;
            delete addPlaceholderParameters.date;
            
            const placeholderRef = await signingPdfDoc.addVisualAsync(addVisualParameters);
            const noOptionalsPlaceholderPdf = await signingPdfDoc.saveAsync();

            expect(placeholderRef).to.not.be.undefined;
            await generateAsset.generateBinaryAsync(signingAssets.paths.noOptionalsPlaceholderPdf, noOptionalsPlaceholderPdf);
            expect(noOptionalsPlaceholderPdf).to.be.deep.equal(signingAssets.noOptionalsPlaceholderPdf);
        })
    })

    describe('updateSignature', function() {

        beforeEach( async function () {
            signingPdfDoc = await SigningPdfDocument.fromPdfAsync(signingAssets.realFieldPdf);
        })

        it('updates signature', async function() {
            signingPdfDoc.updateSignature('Signature', updateParameters);
            const updatePdf = await signingPdfDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingAssets.paths.updatePdf, updatePdf);
            expect(updatePdf).to.be.deep.equal(signingAssets.updatePdf);
        })

        it('updates signature (no visual ref)', async function() {
            delete updateParameters.visualRef;

            signingPdfDoc.updateSignature('Signature', updateParameters);
            const noVisualRefUpdatePdf = await signingPdfDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingAssets.paths.noVisualRefUpdatePdf, noVisualRefUpdatePdf);
            expect(noVisualRefUpdatePdf).to.be.deep.equal(signingAssets.noVisualRefUpdatePdf);
        })

        it('updates signature (no font)', async function() {
            updateParameters.embedFont = false;

            signingPdfDoc.updateSignature('Signature', updateParameters);
            const noFontUpdatePdf = await signingPdfDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingAssets.paths.noFontUpdatePdf, noFontUpdatePdf);
            expect(noFontUpdatePdf).to.be.deep.equal(signingAssets.noFontUpdatePdf);
        })

        it('updates signature (no optionals)', async function() {
            delete updateParameters.visualRef;

            signingPdfDoc.updateSignature('Signature', updateParameters);
            const noOptionalsUpdatedPdf = await signingPdfDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingAssets.paths.noOptionalsUpdatedPdf, noOptionalsUpdatedPdf);
            expect(noOptionalsUpdatedPdf).to.be.deep.equal(signingAssets.noOptionalsUpdatedPdf);
        })

        it('throws for signature not found', async function() {
            expect(() => signingPdfDoc.updateSignature('Invalid Signature Name', updateParameters)).to.throw(SignatureNotFoundError);
        })
    })

    describe('saveAsync', function() {
        it('saves pdf', async function() {
            const savePdf = await signingPdfDoc.saveAsync();

            await generateAsset.generateBinaryAsync(signingAssets.paths.savePdf, savePdf);
            expect(savePdf).to.be.deep.equal(signingAssets.savePdf);
        })
    })

    describe('getPlaceholderRanges', function() {
        it('returns placeholder ranges', async function() {
            signingPdfDoc = await SigningPdfDocument.fromPdfAsync(signingAssets.realPlaceholderPdf);

            const ranges = await signingPdfDoc.getPlaceholderRanges();

            expect(ranges).to.be.deep.equal({ before: { start: 0, length: 2073 }, signature: { start: 2073, length: 4098 }, after: { start: 6171, length: 413 } });
        })

        it('throws for field', async function() {
            signingPdfDoc = await SigningPdfDocument.fromPdfAsync(signingAssets.realFieldPdf);

            expect(() => signingPdfDoc.getPlaceholderRanges()).to.throw(NoPlaceholderError);
        })

        it('throws for pdf', async function() {
            expect(() => signingPdfDoc.getPlaceholderRanges()).to.throw(NoPlaceholderError);
        })
    })
})
