import { AddSignatureFieldParameters, SigningPdfDocument } from './signing-pdf-document';

import { generatePdfLibPdfAsync } from '../test/_helpers/pdf-helpers';
import { generateAsset } from '../test/_helpers/generate-asset';
import { signingAssets } from '../test/_run-assets/signing-pdf-document/assets-signing';

import { expect } from 'chai';
import { PDFRef } from 'pdf-lib';

describe.only('SigningPdfDocument', function () {

    let signingPdfDoc: SigningPdfDocument;
    let parameters: AddSignatureFieldParameters = {
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
    }
    
    beforeEach(async function () {
        signingPdfDoc = await SigningPdfDocument.loadAsync(signingAssets.pdf);
    })

    it('_generate', async function () {
        const pdf = await generatePdfLibPdfAsync();
        await generateAsset.generateBinaryAsync(signingAssets.paths.pdf, pdf);
    })

    describe('addSignatureField', function() {
        it('adds signature field', async function() {
            signingPdfDoc.addSignatureField(parameters);
            const fieldPdf = await signingPdfDoc.saveAsync(signingAssets.pdf);

            await generateAsset.generateBinaryAsync(signingAssets.paths.fieldPdf, fieldPdf);
            expect(fieldPdf).to.be.deep.equal(signingAssets.fieldPdf);
        })

        it('adds signature field (no name)', async function() {
            delete parameters.name;

            signingPdfDoc.addSignatureField(parameters);
            const noNameFieldPdf = await signingPdfDoc.saveAsync(signingAssets.pdf);

            await generateAsset.generateBinaryAsync(signingAssets.paths.noNameFieldPdf, noNameFieldPdf);
            expect(noNameFieldPdf).to.be.deep.equal(signingAssets.noNameFieldPdf);
        })

        it('adds signature field (no rectangle)', async function() {
            delete parameters.rectangle;

            signingPdfDoc.addSignatureField(parameters);
            const noRectangleFieldPdf = await signingPdfDoc.saveAsync(signingAssets.pdf);

            await generateAsset.generateBinaryAsync(signingAssets.paths.noRectangleFieldPdf, noRectangleFieldPdf);
            expect(noRectangleFieldPdf).to.be.deep.equal(signingAssets.noRectangleFieldPdf);
        })

        it('adds signature field (no visual ref)', async function() {
            delete parameters.visualRef;

            signingPdfDoc.addSignatureField(parameters);
            const noVisualRefFieldPdf = await signingPdfDoc.saveAsync(signingAssets.pdf);

            await generateAsset.generateBinaryAsync(signingAssets.paths.noVisualRefFieldPdf, noVisualRefFieldPdf);
            expect(noVisualRefFieldPdf).to.be.deep.equal(signingAssets.noVisualRefFieldPdf);
        })

        it('adds signature field (no placeholder ref)', async function() {
            delete parameters.placeholderRef;

            signingPdfDoc.addSignatureField(parameters);
            const noPlaceholderRefFieldPdf = await signingPdfDoc.saveAsync(signingAssets.pdf);

            await generateAsset.generateBinaryAsync(signingAssets.paths.noPlaceholderRefFieldPdf, noPlaceholderRefFieldPdf);
            expect(noPlaceholderRefFieldPdf).to.be.deep.equal(signingAssets.noPlaceholderRefFieldPdf);
        })

        it('adds signature field (no font)', async function() {
            parameters.embedFont = false;

            signingPdfDoc.addSignatureField(parameters);
            const noFontFieldPdf = await signingPdfDoc.saveAsync(signingAssets.pdf);

            await generateAsset.generateBinaryAsync(signingAssets.paths.noFontFieldPdf, noFontFieldPdf);
            expect(noFontFieldPdf).to.be.deep.equal(signingAssets.noFontFieldPdf);
        })

        it('adds signature field (no optionals)', async function() {
            delete parameters.name;
            delete parameters.rectangle;
            delete parameters.visualRef;
            delete parameters.placeholderRef;

            signingPdfDoc.addSignatureField(parameters);
            const noOptionalsFieldPdf = await signingPdfDoc.saveAsync(signingAssets.pdf);

            await generateAsset.generateBinaryAsync(signingAssets.paths.noOptionalsFieldPdf, noOptionalsFieldPdf);
            expect(noOptionalsFieldPdf).to.be.deep.equal(signingAssets.noOptionalsFieldPdf);
        })

        it('adds signature field (page two)', async function() {
            parameters.pageIndex = 1;

            signingPdfDoc.addSignatureField(parameters);
            const pageTwoFieldPdf = await signingPdfDoc.saveAsync(signingAssets.pdf);

            await generateAsset.generateBinaryAsync(signingAssets.paths.pageTwoFieldPdf, pageTwoFieldPdf);
            expect(pageTwoFieldPdf).to.be.deep.equal(signingAssets.pageTwoFieldPdf);
        })
    })
})
