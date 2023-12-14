import { SignatureEmbeder } from './signature-embeder';
import { PdfSigner } from './pdf-signer';
import { SignatureComputer } from './signature-computer';
import { SignerSettings } from './models/settings';
import { NoPlaceholderError, TooSmallPlaceholderError } from './errors';

import { generatePdfLibPdfAsync } from '../test/_helpers/pdf-helpers';
import { generateAsset } from '../test/_helpers/generate-asset';
import { embederAssets } from '../test/_run-assets/signature-embeder/assets-embeder';
import { settingsAssets } from '../test/_run-assets/signature-computer/assets-settings';

import { expect } from 'chai';

describe('SignatureEmbeder', function () {

    let signatureEmbeder: SignatureEmbeder;
    
    beforeEach(async function() {
        signatureEmbeder = await SignatureEmbeder.loadAsync(embederAssets.placeholder);
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
        
        const signatureComputer = new SignatureComputer(signerSettings.signatureComputer);
        const signDate: Date = new Date(2023, 1, 20, 18, 47, 35);


        const pdf = await generatePdfLibPdfAsync();
        await generateAsset.generateBinaryAsync(embederAssets.paths.pdf, pdf);

        const placeholder = await pdfSigner.addPlaceholderAsync(pdf, { pageNumber: 1, signature: { date: signDate } });
        await generateAsset.generateBinaryAsync(embederAssets.paths.placeholder, placeholder);
        
        const signBuffer = Buffer.concat([ placeholder.subarray(0, placeholder.indexOf('<AA')), placeholder.subarray(placeholder.indexOf('AA>') + 3) ]);
        const signature = signatureComputer.computeSignature(signBuffer, signDate);
        await generateAsset.generateBinaryAsync(embederAssets.paths.signature, signature);
    })

    describe('getSignBuffer', function() {
        it('computes sign buffer', async function() {
            const signBuffer = signatureEmbeder.getSignBuffer();

            await generateAsset.generateBinaryAsync(embederAssets.paths.signBuffer, signBuffer);
            expect(signBuffer).to.be.deep.equal(embederAssets.signBuffer);
        })

        it('throws for pdf without placeholder', async function() {
            await expect(SignatureEmbeder.loadAsync(embederAssets.pdf)).to.be.rejectedWith(NoPlaceholderError);
        })
    })

    describe('embedSignature', function() {
        it('embeds signature', async function() {
            const signedPdf = signatureEmbeder.embedSignature(embederAssets.signature);

            await generateAsset.generateBinaryAsync(embederAssets.paths.signedPdf, signedPdf);
            expect(signedPdf).to.be.deep.equal(embederAssets.signedPdf);
        })
    })

    describe('embedHexSignature', function() {
        it('embeds signature', async function() {
            const signedPdf = signatureEmbeder.embedHexSignature(embederAssets.signature.toString('hex').toUpperCase());

            await generateAsset.generateBinaryAsync(embederAssets.paths.signedPdf, signedPdf);
            expect(signedPdf).to.be.deep.equal(embederAssets.signedPdf);
        })

        it('embeds smaller signature', async function() {
            expect(() => signatureEmbeder.embedHexSignature('A'.repeat(4095))).to.not.throw();
        })

        it('embeds exactly signature', async function() {
            expect(() => signatureEmbeder.embedHexSignature('A'.repeat(4096))).to.not.throw();
        })

        it('throws for bigger signature', async function() {
            expect(() => signatureEmbeder.embedHexSignature('A'.repeat(4097))).to.throw(TooSmallPlaceholderError);
        })
    })
})
