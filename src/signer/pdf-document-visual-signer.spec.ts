import { AddVisualSignatureParameters, PdfDocumentVisualSigner } from './pdf-document-visual-signer';
import { DigitallySignedError } from '../errors';

import { generateAsset, generatePlaceholderPdfAsync, generateFieldPdfAsync, generatePdf17Async, generatePdf13Async } from '../../test/_helpers';
import { pdfDocumentVisualSignerAssets } from '../../test/_run-assets/signer/assets-pdf-document-visual-signer';

import { expect } from 'chai';

it('_generate', async function () {
    const pdf = await generatePdf17Async({ pageCount: 2 });
    await generateAsset.generateBinaryAsync(pdfDocumentVisualSignerAssets.paths.pdf, pdf);

    const reverseYPdf = await generatePdf13Async({ pageCount: 2 });
    await generateAsset.generateBinaryAsync(pdfDocumentVisualSignerAssets.paths.reverseYPdf, reverseYPdf);

    const placeholderPdf = await generatePlaceholderPdfAsync(pdf);
    await generateAsset.generateBinaryAsync(pdfDocumentVisualSignerAssets.paths.placeholderPdf, placeholderPdf);

    const fieldPdf = await generateFieldPdfAsync(pdf);
    await generateAsset.generateBinaryAsync(pdfDocumentVisualSignerAssets.paths.fieldPdf, fieldPdf);
})


describe('PdfDocumentVisualSigner', function () {

    let pdfDocSigner: PdfDocumentVisualSigner;
    let addVisualParameters: AddVisualSignatureParameters;
    
    beforeEach(async function () {
        addVisualParameters = { 
            pageIndex: 0,
            rectangle: { 
                left: 50, 
                top: 100, 
                right: 50 + 214, 
                bottom: 100 + 70
            }, 
            background: pdfDocumentVisualSignerAssets.visual, 
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
            ],

            backgroundName: 'background1'
        };
        pdfDocSigner = await PdfDocumentVisualSigner.fromPdfAsync(pdfDocumentVisualSignerAssets.pdf);
    })


    describe('addVisualSignatureAsync', function() {
        it('adds visual', async function() {
            await pdfDocSigner.addVisualSignatureAsync(addVisualParameters);            
            const visualPdf = await pdfDocSigner.saveAsync();

            await generateAsset.generateBinaryAsync(pdfDocumentVisualSignerAssets.paths.visualPdf, visualPdf);
            expect(visualPdf).to.be.deep.equal(pdfDocumentVisualSignerAssets.visualPdf);
        })

        it('adds visual (reverseY)', async function() {
            pdfDocSigner = await PdfDocumentVisualSigner.fromPdfAsync(pdfDocumentVisualSignerAssets.reverseYPdf);

            addVisualParameters.reverseY = true;

            await pdfDocSigner.addVisualSignatureAsync(addVisualParameters);            
            const reverseYVisualPdf = await pdfDocSigner.saveAsync();

            await generateAsset.generateBinaryAsync(pdfDocumentVisualSignerAssets.paths.reverseYVisualPdf, reverseYVisualPdf);
            expect(reverseYVisualPdf).to.be.deep.equal(pdfDocumentVisualSignerAssets.reverseYVisualPdf);
        })

        it('adds visual (no background)', async function() {
            delete addVisualParameters.background;

            await pdfDocSigner.addVisualSignatureAsync(addVisualParameters);
            const noBackgroundVisualPdf = await pdfDocSigner.saveAsync();

            await generateAsset.generateBinaryAsync(pdfDocumentVisualSignerAssets.paths.noBackgroundVisualPdf, noBackgroundVisualPdf);
            expect(noBackgroundVisualPdf).to.be.deep.equal(pdfDocumentVisualSignerAssets.noBackgroundVisualPdf);
        })

        it('adds visual (no texts)', async function() {
            delete addVisualParameters.texts;
            
            await pdfDocSigner.addVisualSignatureAsync(addVisualParameters);
            const noTextsVisualPdf = await pdfDocSigner.saveAsync();

            await generateAsset.generateBinaryAsync(pdfDocumentVisualSignerAssets.paths.noTextsVisualPdf, noTextsVisualPdf);
            expect(noTextsVisualPdf).to.be.deep.equal(pdfDocumentVisualSignerAssets.noTextsVisualPdf);
        })

        it('adds visual (no optionals)', async function() {
            delete addVisualParameters.background;
            delete addVisualParameters.texts;
            
            await pdfDocSigner.addVisualSignatureAsync(addVisualParameters);
            const noOptionalsVisualPdf = await pdfDocSigner.saveAsync();

            await generateAsset.generateBinaryAsync(pdfDocumentVisualSignerAssets.paths.noOptionalsVisualPdf, noOptionalsVisualPdf);
            expect(noOptionalsVisualPdf).to.be.deep.equal(pdfDocumentVisualSignerAssets.noOptionalsVisualPdf);
        })

        it('throws for placeholder pdf', async function() {
            pdfDocSigner = await PdfDocumentVisualSigner.fromPdfAsync(pdfDocumentVisualSignerAssets.placeholderPdf);

            await expect(pdfDocSigner.addVisualSignatureAsync(addVisualParameters)).to.be.rejectedWith(DigitallySignedError);
        })

    })

    describe('saveAsync', function() {
        it('saves pdf', async function() {
            const savePdf = await pdfDocSigner.saveAsync();

            await generateAsset.generateBinaryAsync(pdfDocumentVisualSignerAssets.paths.savePdf, savePdf);
            expect(savePdf).to.be.deep.equal(pdfDocumentVisualSignerAssets.savePdf);
        })
    })
})
