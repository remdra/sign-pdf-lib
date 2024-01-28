import { PdfSigner } from './pdf-signer';
import { SignDigitalParameters, SignFieldParameters, AddFieldParameters, SignVisualParameters } from '../models/parameters';
import { SignerSettings } from '../models/settings';


import { pdfSignerAssets13 } from '../../test/_run-assets/signer/assets-pdf-signer-pdf';
import { pdfSignerAssetsRegression } from '../../test/_run-assets/signer/assets-pdf-signer-regression';
import { commonAssets } from '../../test/_run-assets/_assets-common';
import { generateAsset, generatePdfAsync } from '../../test/_helpers';

import { use as chaiUse } from 'chai';
import { expect } from 'chai';

const chaiAsPromised = require('chai-as-promised');
chaiUse(chaiAsPromised);


it('_generate', async function () {
    const pdf = await generatePdfAsync({ pageCount: 2 });
    await generateAsset.generateBinaryAsync(pdfSignerAssets13.paths.pdf, pdf);
})

describe('PdfSigner (pdf 1.3)', function () {

    let pdfSigner: PdfSigner;
    let info: SignDigitalParameters;
    let fieldInfo: SignFieldParameters;
    let addFieldInfo: AddFieldParameters;
    let visualInfo: SignVisualParameters;
    let settings: SignerSettings;

    beforeEach(function () {
        info = {
            pageNumber: 1,
            name: 'Signature',

            signature: {
                name: 'Test Signer',
                location: 'Timisoara',
                reason: 'Signing',
                date: new Date(2023, 1, 20, 18, 47, 35), 
                contactInfo: 'signer@semnezonline.ro'
            },
            visual: {
                rectangle: { left: 50, top: 100, right: 50 + 214, bottom: 100 + 70 },
                background: pdfSignerAssets13.signatureImage,
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
            }
        };

        fieldInfo = {
            fieldName: 'Signature',

            signature: {
                name: 'Test Signer',
                location: 'Timisoara',
                reason: 'Signing',
                date: new Date(2023, 1, 20, 18, 47, 35), 
                contactInfo: 'signer@semnezonline.ro',
            },
            visual: {
                background: pdfSignerAssets13.signatureImage,
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
            }
        };

        addFieldInfo = {
            pageNumber: 1,
            name: 'Signature',
            rectangle: { left: 50, top: 100, right: 50 + 214, bottom: 100 + 70 }
        }

        visualInfo = {
            pageNumber: 1,

            rectangle: { left: 50, top: 100, right: 50 + 214, bottom: 100 + 70 },
            background: pdfSignerAssets13.signatureImage,
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
            
            // @ts-ignore
            backgroundName: 'background1'
        };

        settings = {
            signatureLength: 4000 - 6,
            rangePlaceHolder: 9999999,
            
            signatureComputer: {
                certificate: commonAssets.p12Certificate,
                password: 'password'
            }
        }
        pdfSigner = new PdfSigner(settings);
    });

    describe('addPlaceholderAsync', function() {
        it('adds placeholder', async function() {
            const placeholderPdf = await pdfSigner.addPlaceholderAsync(pdfSignerAssets13.pdf, info);

            await generateAsset.generateBinaryAsync(pdfSignerAssets13.paths.placeholderPdf, placeholderPdf);
            expect(placeholderPdf).to.be.deep.equal(pdfSignerAssets13.placeholderPdf);
        })

        it('adds placeholder (no name)', async function() {
            delete info.name;

            const noNamePlaceholderPdf = await pdfSigner.addPlaceholderAsync(pdfSignerAssets13.pdf, info);

            await generateAsset.generateBinaryAsync(pdfSignerAssets13.paths.noNamePlaceholderPdf, noNamePlaceholderPdf);
            expect(noNamePlaceholderPdf).to.be.deep.equal(pdfSignerAssets13.noNamePlaceholderPdf);
        })

        it('adds placeholder (no signature)', async function() {
            delete info.signature;

            const noSignaturePlaceholderPdf = await pdfSigner.addPlaceholderAsync(pdfSignerAssets13.pdf, info);

            await generateAsset.generateBinaryAsync(pdfSignerAssets13.paths.noSignaturePlaceholderPdf, noSignaturePlaceholderPdf);
            expect(noSignaturePlaceholderPdf).to.be.deep.equal(pdfSignerAssets13.noSignaturePlaceholderPdf);
        })

        it('adds placeholder (no visual)', async function() {
            delete info.visual;

            const noVisualPlaceholderPdf = await pdfSigner.addPlaceholderAsync(pdfSignerAssets13.pdf, info);

            await generateAsset.generateBinaryAsync(pdfSignerAssets13.paths.noVisualPlaceholderPdf, noVisualPlaceholderPdf);
            expect(noVisualPlaceholderPdf).to.be.deep.equal(pdfSignerAssets13.noVisualPlaceholderPdf);
        })

        it('adds placeholder (no optionals)', async function() {
            delete info.name;
            delete info.signature;
            delete info.visual;

            const noOptionalsPlaceholderPdf = await pdfSigner.addPlaceholderAsync(pdfSignerAssets13.pdf, info);

            await generateAsset.generateBinaryAsync(pdfSignerAssets13.paths.noOptionalsPlaceholderPdf, noOptionalsPlaceholderPdf);
            expect(noOptionalsPlaceholderPdf).to.be.deep.equal(pdfSignerAssets13.noOptionalsPlaceholderPdf);
        })
    })

    describe('addFieldAsync', function() {
        it('adds field', async function() {
            const fieldPdf = await pdfSigner.addFieldAsync(pdfSignerAssets13.pdf, addFieldInfo);

            await generateAsset.generateBinaryAsync(pdfSignerAssets13.paths.fieldPdf, fieldPdf);
            expect(fieldPdf).to.be.deep.equal(pdfSignerAssets13.fieldPdf);
        })

        it('adds field (no name)', async function() {
            delete addFieldInfo.name;

            const noNameFieldPdf = await pdfSigner.addFieldAsync(pdfSignerAssets13.pdf, addFieldInfo);

            await generateAsset.generateBinaryAsync(pdfSignerAssets13.paths.noNameFieldPdf, noNameFieldPdf);
            expect(noNameFieldPdf).to.be.deep.equal(pdfSignerAssets13.noNameFieldPdf);
        })

        it('adds field (no optionals)', async function() {
            delete addFieldInfo.name;

            const noOptionalsFieldPdf = await pdfSigner.addFieldAsync(pdfSignerAssets13.pdf, addFieldInfo);

            await generateAsset.generateBinaryAsync(pdfSignerAssets13.paths.noOptionalsFieldPdf, noOptionalsFieldPdf);
            expect(noOptionalsFieldPdf).to.be.deep.equal(pdfSignerAssets13.noOptionalsFieldPdf);
        })
    })
    
    describe('signAsync', function() {
        it('signs document', async function() {
            const signedPdf = await pdfSigner.signAsync(pdfSignerAssets13.pdf, info);

            await generateAsset.generateBinaryAsync(pdfSignerAssets13.paths.signedPdf, signedPdf);
            expect(signedPdf).to.be.deep.equal(pdfSignerAssets13.signedPdf);
        })

        it('signs document (no name)', async function() {
            delete info.name;

            const noNameSignedPdf = await pdfSigner.signAsync(pdfSignerAssets13.pdf, info);

            await generateAsset.generateBinaryAsync(pdfSignerAssets13.paths.noNameSignedPdf, noNameSignedPdf);
            expect(noNameSignedPdf).to.be.deep.equal(pdfSignerAssets13.noNameSignedPdf);
        })

        it('signs document (no signature)', async function() {
            delete info.signature;

            const noSignatureSignedPdf = await pdfSigner.signAsync(pdfSignerAssets13.pdf, info);

            await generateAsset.generateBinaryAsync(pdfSignerAssets13.paths.noSignatureSignedPdf, noSignatureSignedPdf);
            expect(noSignatureSignedPdf).to.be.deep.equal(pdfSignerAssets13.noSignatureSignedPdf);
        })

        it('signs document (no visual)', async function() {
            delete info.visual;

            const noVisualSignedPdf = await pdfSigner.signAsync(pdfSignerAssets13.pdf, info);

            await generateAsset.generateBinaryAsync(pdfSignerAssets13.paths.noVisualSignedPdf, noVisualSignedPdf);
            expect(noVisualSignedPdf).to.be.deep.equal(pdfSignerAssets13.noVisualSignedPdf);
        })

        it('signs document (no optionals)', async function() {
            delete info.name;
            delete info.signature;
            delete info.visual;

            const noOptionalsSignedPdf = await pdfSigner.signAsync(pdfSignerAssets13.pdf, info);

            await generateAsset.generateBinaryAsync(pdfSignerAssets13.paths.noOptionalsSignedPdf, noOptionalsSignedPdf);
            expect(noOptionalsSignedPdf).to.be.deep.equal(pdfSignerAssets13.noOptionalsSignedPdf);
        })

        it('signs already signed document', async function() {
            const res = await pdfSigner.signAsync(pdfSignerAssets13.signedPdf, info);

            await generateAsset.generateBinaryAsync(pdfSignerAssets13.paths.twiceSignedPdf, res);
            expect(res).to.be.deep.equal(pdfSignerAssets13.twiceSignedPdf);
        })
    })

    describe('signFieldAsync', function() {
        it('signs document', async function() {
            const fieldSignedPdf = await pdfSigner.signFieldAsync(pdfSignerAssets13.fieldPdf, fieldInfo);

            await generateAsset.generateBinaryAsync(pdfSignerAssets13.paths.fieldSignedPdf, fieldSignedPdf);
            expect(fieldSignedPdf).to.be.deep.equal(pdfSignerAssets13.fieldSignedPdf);
        })

        it('signs document (no signature)', async function() {
            delete fieldInfo.signature;

            const noSignatureFieldSignedPdf = await pdfSigner.signFieldAsync(pdfSignerAssets13.fieldPdf, fieldInfo);

            await generateAsset.generateBinaryAsync(pdfSignerAssets13.paths.noSignatureFieldSignedPdf, noSignatureFieldSignedPdf);
            expect(noSignatureFieldSignedPdf).to.be.deep.equal(pdfSignerAssets13.noSignatureFieldSignedPdf);
        })

        it('signs document (no visual)', async function() {
            delete fieldInfo.visual;

            const noVisualFieldSignedPdf = await pdfSigner.signFieldAsync(pdfSignerAssets13.fieldPdf, fieldInfo);

            await generateAsset.generateBinaryAsync(pdfSignerAssets13.paths.noVisualFieldSignedPdf, noVisualFieldSignedPdf);
            expect(noVisualFieldSignedPdf).to.be.deep.equal(pdfSignerAssets13.noVisualFieldSignedPdf);
        })

        it('signs document (no optionals)', async function() {
            delete fieldInfo.signature;
            delete fieldInfo.visual;

            const noOptionalsFieldSignedPdf = await pdfSigner.signFieldAsync(pdfSignerAssets13.fieldPdf, fieldInfo);

            await generateAsset.generateBinaryAsync(pdfSignerAssets13.paths.noOptionalsFieldSignedPdf, noOptionalsFieldSignedPdf);
            expect(noOptionalsFieldSignedPdf).to.be.deep.equal(pdfSignerAssets13.noOptionalsFieldSignedPdf);
        })

        it('signs specified field', async function() {
            addFieldInfo.rectangle.left += 250;
            addFieldInfo.rectangle.right += 250;
            addFieldInfo.name = 'Signature2';
            const twoFieldsPdf = await pdfSigner.addFieldAsync(pdfSignerAssets13.fieldPdf, addFieldInfo);

            fieldInfo.fieldName = 'Signature2';

            const specifiedFieldSignedPdf = await pdfSigner.signFieldAsync(twoFieldsPdf, fieldInfo);
            
            await generateAsset.generateBinaryAsync(pdfSignerAssets13.paths.specifiedFieldSignedPdf, specifiedFieldSignedPdf);
            expect(specifiedFieldSignedPdf).to.be.deep.equal(pdfSignerAssets13.specifiedFieldSignedPdf);
        })

        it('throws when field not found', async function() {
            fieldInfo.fieldName = 'Another name';

            await expect(pdfSigner.signFieldAsync(pdfSignerAssets13.fieldPdf, fieldInfo)).to.be.rejected;
        })
    })
    
    describe('signVisualAsync', function() {
        it('signs document', async function() {
            const visualSignedPdf = await pdfSigner.signVisualAsync(pdfSignerAssets13.pdf, visualInfo);

            await generateAsset.generateBinaryAsync(pdfSignerAssets13.paths.visualSignedPdf, visualSignedPdf);
            expect(visualSignedPdf).to.be.deep.equal(pdfSignerAssets13.visualSignedPdf);
        })

        it('signs document (no background)', async function() {
            delete visualInfo.background;

            const noBackgroundVisualSignedPdf = await pdfSigner.signVisualAsync(pdfSignerAssets13.pdf, visualInfo);

            await generateAsset.generateBinaryAsync(pdfSignerAssets13.paths.noBackgroundVisualSignedPdf, noBackgroundVisualSignedPdf);
            expect(noBackgroundVisualSignedPdf).to.be.deep.equal(pdfSignerAssets13.noBackgroundVisualSignedPdf);
        })

        it('signs document (no texts)', async function() {
            delete visualInfo.texts;

            const noTextsVisualSignedPdf = await pdfSigner.signVisualAsync(pdfSignerAssets13.pdf, visualInfo);

            await generateAsset.generateBinaryAsync(pdfSignerAssets13.paths.noTextsVisualSignedPdf, noTextsVisualSignedPdf);
            expect(noTextsVisualSignedPdf).to.be.deep.equal(pdfSignerAssets13.noTextsVisualSignedPdf);
        })

        it('signs document (no optionals)', async function() {
            delete visualInfo.background;
            delete visualInfo.texts;

            const noOptionalsVisualSignedPdf = await pdfSigner.signVisualAsync(pdfSignerAssets13.pdf, visualInfo);

            await generateAsset.generateBinaryAsync(pdfSignerAssets13.paths.noOptionalsVisualSignedPdf, noOptionalsVisualSignedPdf);
            expect(noOptionalsVisualSignedPdf).to.be.deep.equal(pdfSignerAssets13.noOptionalsVisualSignedPdf);
        })
    })
    
    describe('verifySignaturesAsync', function() {
        it('validates signatures', async function() {
            const res = await pdfSigner.verifySignaturesAsync(pdfSignerAssets13.signedPdf);

            await generateAsset.generateJsonAsync(pdfSignerAssets13.paths.checkSignedPdf, res);
            expect(res).to.be.deep.equal(pdfSignerAssets13.checkSignedPdf);
        })
    })

    describe('getFieldsAsync', function() {
        it('returns fields', async function() {
            const res = await pdfSigner.getFieldsAsync(pdfSignerAssets13.fieldPdf);
            expect(res).to.be.deep.equal([ { name: 'Signature', pageNumber: 1 } ]);
        })
    })
})

describe('PdfSigner Regression', function () {

    let pdfSigner: PdfSigner;
    let fieldInfo: SignFieldParameters;
    let settings: SignerSettings;

    beforeEach(function () {
        fieldInfo = {
            fieldName: 'Signature1',

            signature: {
                name: 'Test Signer',
                location: 'Timisoara',
                reason: 'Signing',
                date: new Date(2023, 1, 20, 18, 47, 35), 
                contactInfo: 'signer@semnezonline.ro',
            },
            visual: {
                background: pdfSignerAssets13.signatureImage,
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
            }
        };

        settings = {
            signatureLength: 4000 - 6,
            rangePlaceHolder: 9999999,
            
            signatureComputer: {
                certificate: commonAssets.p12Certificate,
                password: 'password'
            }
        }
        pdfSigner = new PdfSigner(settings);
    });

    it('signs field', async function() {
        fieldInfo.fieldName = 'Signature28';

        const signed = await pdfSigner.signFieldAsync(pdfSignerAssetsRegression.fieldPdf, fieldInfo);
            
        await generateAsset.generateBinaryAsync(pdfSignerAssetsRegression.paths.fieldSignedPdf, signed);
        expect(signed).to.be.deep.equal(pdfSignerAssetsRegression.fieldSignedPdf);

        const fields = await pdfSigner.getFieldsAsync(pdfSignerAssetsRegression.fieldPdf);
        expect(fields).to.be.deep.equal([ { name: 'Signature28', pageNumber: 9 } ])
    })

    it('check signatures', async function() {
        const checkResult = await pdfSigner.verifySignaturesAsync(pdfSignerAssetsRegression.verifySignaturesPdf);
            
        await generateAsset.generateJsonAsync(pdfSignerAssetsRegression.paths.checkResult, checkResult);
        expect(checkResult).to.be.deep.equal(pdfSignerAssetsRegression.checkResult);
    })
})