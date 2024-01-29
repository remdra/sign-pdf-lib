import { PdfSigner } from './pdf-signer';
import { SignDigitalParameters, SignFieldParameters, AddFieldParameters, SignVisualParameters } from '../models/parameters';
import { SignerSettings } from '../models/settings';


import { pdfSignerAssets } from '../../test/_run-assets/signer/assets-pdf-signer-pdf';
import { pdfSignerAssetsRegression } from '../../test/_run-assets/signer/assets-pdf-signer-regression';
import { commonAssets } from '../../test/_run-assets/_assets-common';
import { generateAsset, generatePdf13Async, generatePdf17Async } from '../../test/_helpers';

import { use as chaiUse } from 'chai';
import { expect } from 'chai';

const chaiAsPromised = require('chai-as-promised');
chaiUse(chaiAsPromised);


it('_generate', async function () {
    const pdf = await generatePdf17Async({ pageCount: 2 });
    await generateAsset.generateBinaryAsync(pdfSignerAssets.paths.pdf, pdf);

    const reverseYPdf = await generatePdf13Async({ pageCount: 2 });
    await generateAsset.generateBinaryAsync(pdfSignerAssets.paths.reverseYPdf, reverseYPdf);
})

describe('PdfSigner', function () {

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
                background: pdfSignerAssets.signatureImage,
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
                background: pdfSignerAssets.signatureImage,
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
            background: pdfSignerAssets.signatureImage,
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
            const placeholderPdf = await pdfSigner.addPlaceholderAsync(pdfSignerAssets.pdf, info);

            await generateAsset.generateBinaryAsync(pdfSignerAssets.paths.placeholderPdf, placeholderPdf);
            expect(placeholderPdf).to.be.deep.equal(pdfSignerAssets.placeholderPdf);
        })

        it('adds placeholder (no name)', async function() {
            delete info.name;

            const noNamePlaceholderPdf = await pdfSigner.addPlaceholderAsync(pdfSignerAssets.pdf, info);

            await generateAsset.generateBinaryAsync(pdfSignerAssets.paths.noNamePlaceholderPdf, noNamePlaceholderPdf);
            expect(noNamePlaceholderPdf).to.be.deep.equal(pdfSignerAssets.noNamePlaceholderPdf);
        })

        it('adds placeholder (no signature)', async function() {
            delete info.signature;

            const noSignaturePlaceholderPdf = await pdfSigner.addPlaceholderAsync(pdfSignerAssets.pdf, info);

            await generateAsset.generateBinaryAsync(pdfSignerAssets.paths.noSignaturePlaceholderPdf, noSignaturePlaceholderPdf);
            expect(noSignaturePlaceholderPdf).to.be.deep.equal(pdfSignerAssets.noSignaturePlaceholderPdf);
        })

        it('adds placeholder (no visual)', async function() {
            delete info.visual;

            const noVisualPlaceholderPdf = await pdfSigner.addPlaceholderAsync(pdfSignerAssets.pdf, info);

            await generateAsset.generateBinaryAsync(pdfSignerAssets.paths.noVisualPlaceholderPdf, noVisualPlaceholderPdf);
            expect(noVisualPlaceholderPdf).to.be.deep.equal(pdfSignerAssets.noVisualPlaceholderPdf);
        })

        it('adds placeholder (no optionals)', async function() {
            delete info.name;
            delete info.signature;
            delete info.visual;

            const noOptionalsPlaceholderPdf = await pdfSigner.addPlaceholderAsync(pdfSignerAssets.pdf, info);

            await generateAsset.generateBinaryAsync(pdfSignerAssets.paths.noOptionalsPlaceholderPdf, noOptionalsPlaceholderPdf);
            expect(noOptionalsPlaceholderPdf).to.be.deep.equal(pdfSignerAssets.noOptionalsPlaceholderPdf);
        })
    })

    describe('addFieldAsync', function() {
        it('adds field', async function() {
            const fieldPdf = await pdfSigner.addFieldAsync(pdfSignerAssets.pdf, addFieldInfo);

            await generateAsset.generateBinaryAsync(pdfSignerAssets.paths.fieldPdf, fieldPdf);
            expect(fieldPdf).to.be.deep.equal(pdfSignerAssets.fieldPdf);
        })

        it('adds field (no name)', async function() {
            delete addFieldInfo.name;

            const noNameFieldPdf = await pdfSigner.addFieldAsync(pdfSignerAssets.pdf, addFieldInfo);

            await generateAsset.generateBinaryAsync(pdfSignerAssets.paths.noNameFieldPdf, noNameFieldPdf);
            expect(noNameFieldPdf).to.be.deep.equal(pdfSignerAssets.noNameFieldPdf);
        })

        it('adds field (no optionals)', async function() {
            delete addFieldInfo.name;

            const noOptionalsFieldPdf = await pdfSigner.addFieldAsync(pdfSignerAssets.pdf, addFieldInfo);

            await generateAsset.generateBinaryAsync(pdfSignerAssets.paths.noOptionalsFieldPdf, noOptionalsFieldPdf);
            expect(noOptionalsFieldPdf).to.be.deep.equal(pdfSignerAssets.noOptionalsFieldPdf);
        })
    })
    
    describe('signAsync', function() {
        it('signs document', async function() {
            const signedPdf = await pdfSigner.signAsync(pdfSignerAssets.pdf, info);

            await generateAsset.generateBinaryAsync(pdfSignerAssets.paths.signedPdf, signedPdf);
            expect(signedPdf).to.be.deep.equal(pdfSignerAssets.signedPdf);
        })

        it('signs document (no name)', async function() {
            delete info.name;

            const noNameSignedPdf = await pdfSigner.signAsync(pdfSignerAssets.pdf, info);

            await generateAsset.generateBinaryAsync(pdfSignerAssets.paths.noNameSignedPdf, noNameSignedPdf);
            expect(noNameSignedPdf).to.be.deep.equal(pdfSignerAssets.noNameSignedPdf);
        })

        it('signs document (no signature)', async function() {
            delete info.signature;

            const noSignatureSignedPdf = await pdfSigner.signAsync(pdfSignerAssets.pdf, info);

            await generateAsset.generateBinaryAsync(pdfSignerAssets.paths.noSignatureSignedPdf, noSignatureSignedPdf);
            expect(noSignatureSignedPdf).to.be.deep.equal(pdfSignerAssets.noSignatureSignedPdf);
        })

        it('signs document (no visual)', async function() {
            delete info.visual;

            const noVisualSignedPdf = await pdfSigner.signAsync(pdfSignerAssets.pdf, info);

            await generateAsset.generateBinaryAsync(pdfSignerAssets.paths.noVisualSignedPdf, noVisualSignedPdf);
            expect(noVisualSignedPdf).to.be.deep.equal(pdfSignerAssets.noVisualSignedPdf);
        })

        it('signs document (no optionals)', async function() {
            delete info.name;
            delete info.signature;
            delete info.visual;

            const noOptionalsSignedPdf = await pdfSigner.signAsync(pdfSignerAssets.pdf, info);

            await generateAsset.generateBinaryAsync(pdfSignerAssets.paths.noOptionalsSignedPdf, noOptionalsSignedPdf);
            expect(noOptionalsSignedPdf).to.be.deep.equal(pdfSignerAssets.noOptionalsSignedPdf);
        })

        it('signs already signed document', async function() {
            info.name = 'Signature2';
            const res = await pdfSigner.signAsync(pdfSignerAssets.signedPdf, info);

            await generateAsset.generateBinaryAsync(pdfSignerAssets.paths.twiceSignedPdf, res);
            expect(res).to.be.deep.equal(pdfSignerAssets.twiceSignedPdf);
        })
    })

    describe('signFieldAsync', function() {
        it('signs document', async function() {
            const fieldSignedPdf = await pdfSigner.signFieldAsync(pdfSignerAssets.fieldPdf, fieldInfo);

            await generateAsset.generateBinaryAsync(pdfSignerAssets.paths.fieldSignedPdf, fieldSignedPdf);
            expect(fieldSignedPdf).to.be.deep.equal(pdfSignerAssets.fieldSignedPdf);
        })

        it('signs document (no signature)', async function() {
            delete fieldInfo.signature;

            const noSignatureFieldSignedPdf = await pdfSigner.signFieldAsync(pdfSignerAssets.fieldPdf, fieldInfo);

            await generateAsset.generateBinaryAsync(pdfSignerAssets.paths.noSignatureFieldSignedPdf, noSignatureFieldSignedPdf);
            expect(noSignatureFieldSignedPdf).to.be.deep.equal(pdfSignerAssets.noSignatureFieldSignedPdf);
        })

        it('signs document (no visual)', async function() {
            delete fieldInfo.visual;

            const noVisualFieldSignedPdf = await pdfSigner.signFieldAsync(pdfSignerAssets.fieldPdf, fieldInfo);

            await generateAsset.generateBinaryAsync(pdfSignerAssets.paths.noVisualFieldSignedPdf, noVisualFieldSignedPdf);
            expect(noVisualFieldSignedPdf).to.be.deep.equal(pdfSignerAssets.noVisualFieldSignedPdf);
        })

        it('signs document (no optionals)', async function() {
            delete fieldInfo.signature;
            delete fieldInfo.visual;

            const noOptionalsFieldSignedPdf = await pdfSigner.signFieldAsync(pdfSignerAssets.fieldPdf, fieldInfo);

            await generateAsset.generateBinaryAsync(pdfSignerAssets.paths.noOptionalsFieldSignedPdf, noOptionalsFieldSignedPdf);
            expect(noOptionalsFieldSignedPdf).to.be.deep.equal(pdfSignerAssets.noOptionalsFieldSignedPdf);
        })

        it('signs specified field', async function() {
            addFieldInfo.rectangle.left += 250;
            addFieldInfo.rectangle.right += 250;
            addFieldInfo.name = 'Signature2';
            const twoFieldsPdf = await pdfSigner.addFieldAsync(pdfSignerAssets.fieldPdf, addFieldInfo);

            fieldInfo.fieldName = 'Signature2';

            const specifiedFieldSignedPdf = await pdfSigner.signFieldAsync(twoFieldsPdf, fieldInfo);
            
            await generateAsset.generateBinaryAsync(pdfSignerAssets.paths.specifiedFieldSignedPdf, specifiedFieldSignedPdf);
            expect(specifiedFieldSignedPdf).to.be.deep.equal(pdfSignerAssets.specifiedFieldSignedPdf);
        })

        it('throws when field not found', async function() {
            fieldInfo.fieldName = 'Another name';

            await expect(pdfSigner.signFieldAsync(pdfSignerAssets.fieldPdf, fieldInfo)).to.be.rejected;
        })
    })
    
    describe('signVisualAsync', function() {
        it('signs document', async function() {
            const visualSignedPdf = await pdfSigner.signVisualAsync(pdfSignerAssets.pdf, visualInfo);

            await generateAsset.generateBinaryAsync(pdfSignerAssets.paths.visualSignedPdf, visualSignedPdf);
            expect(visualSignedPdf).to.be.deep.equal(pdfSignerAssets.visualSignedPdf);
        })

        it('signs document (reverseY)', async function() {
            visualInfo.reverseY = true;

            const visualSignedReverseYPdf = await pdfSigner.signVisualAsync(pdfSignerAssets.reverseYPdf, visualInfo);

            await generateAsset.generateBinaryAsync(pdfSignerAssets.paths.visualSignedReverseYPdf, visualSignedReverseYPdf);
            expect(visualSignedReverseYPdf).to.be.deep.equal(pdfSignerAssets.visualSignedReverseYPdf);
        })

        it('signs document (no background)', async function() {
            delete visualInfo.background;

            const noBackgroundVisualSignedPdf = await pdfSigner.signVisualAsync(pdfSignerAssets.pdf, visualInfo);

            await generateAsset.generateBinaryAsync(pdfSignerAssets.paths.noBackgroundVisualSignedPdf, noBackgroundVisualSignedPdf);
            expect(noBackgroundVisualSignedPdf).to.be.deep.equal(pdfSignerAssets.noBackgroundVisualSignedPdf);
        })

        it('signs document (no texts)', async function() {
            delete visualInfo.texts;

            const noTextsVisualSignedPdf = await pdfSigner.signVisualAsync(pdfSignerAssets.pdf, visualInfo);

            await generateAsset.generateBinaryAsync(pdfSignerAssets.paths.noTextsVisualSignedPdf, noTextsVisualSignedPdf);
            expect(noTextsVisualSignedPdf).to.be.deep.equal(pdfSignerAssets.noTextsVisualSignedPdf);
        })

        it('signs document (no optionals)', async function() {
            delete visualInfo.background;
            delete visualInfo.texts;

            const noOptionalsVisualSignedPdf = await pdfSigner.signVisualAsync(pdfSignerAssets.pdf, visualInfo);

            await generateAsset.generateBinaryAsync(pdfSignerAssets.paths.noOptionalsVisualSignedPdf, noOptionalsVisualSignedPdf);
            expect(noOptionalsVisualSignedPdf).to.be.deep.equal(pdfSignerAssets.noOptionalsVisualSignedPdf);
        })
    })
    
    describe('verifySignaturesAsync', function() {
        it('validates signatures', async function() {
            const res = await pdfSigner.verifySignaturesAsync(pdfSignerAssets.signedPdf);

            await generateAsset.generateJsonAsync(pdfSignerAssets.paths.checkSignedPdf, res);
            expect(res).to.be.deep.equal(pdfSignerAssets.checkSignedPdf);
        })
    })

    describe('getFieldsAsync', function() {
        it('returns fields', async function() {
            const res = await pdfSigner.getFieldsAsync(pdfSignerAssets.fieldPdf);
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
                background: pdfSignerAssets.signatureImage,
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