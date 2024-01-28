import { SignatureEmbeder } from './signature-embeder';
import { NoPlaceholderError, TooSmallPlaceholderError } from '../errors';

import { generatePdfAsync, generatePlaceholderPdfAsync, generateSignature } from '../../test/_helpers';
import { generateAsset } from '../../test/_helpers/generate-asset';
import { signatureEmbederAssets } from '../../test/_run-assets/signer/assets-signature-embeder';

import { expect } from 'chai';

it('_generate', async function () {
    const pdf = await generatePdfAsync({ pageCount: 2 });
    await generateAsset.generateBinaryAsync(signatureEmbederAssets.paths.pdf, pdf);

    const placeholderPdf = await generatePlaceholderPdfAsync(pdf);
    await generateAsset.generateBinaryAsync(signatureEmbederAssets.paths.placeholder, placeholderPdf);

    const signature = generateSignature(placeholderPdf);
    await generateAsset.generateBinaryAsync(signatureEmbederAssets.paths.signature, signature);
})


describe('SignatureEmbeder', function () {

    let signatureEmbeder: SignatureEmbeder;
    
    beforeEach(async function() {
        signatureEmbeder = await SignatureEmbeder.fromPdfAsync(signatureEmbederAssets.placeholder);
    })

    describe('getSignBuffer', function() {
        it('computes sign buffer', async function() {
            const signBuffer = signatureEmbeder.getSignBuffer();

            await generateAsset.generateBinaryAsync(signatureEmbederAssets.paths.signBuffer, signBuffer);
            expect(signBuffer).to.be.deep.equal(signatureEmbederAssets.signBuffer);
        })

        it('throws for pdf without placeholder', async function() {
            await expect(SignatureEmbeder.fromPdfAsync(signatureEmbederAssets.pdf)).to.be.rejectedWith(NoPlaceholderError);
        })
    })

    describe('embedSignature', function() {
        it('embeds signature', async function() {
            const signedPdf = signatureEmbeder.embedSignature(signatureEmbederAssets.signature);

            await generateAsset.generateBinaryAsync(signatureEmbederAssets.paths.signedPdf, signedPdf);
            expect(signedPdf).to.be.deep.equal(signatureEmbederAssets.signedPdf);
        })
    })

    describe('embedHexSignature', function() {
        it('embeds signature', async function() {
            const signedPdf = signatureEmbeder.embedHexSignature(signatureEmbederAssets.signature.toString('hex').toUpperCase());

            await generateAsset.generateBinaryAsync(signatureEmbederAssets.paths.signedPdf, signedPdf);
            expect(signedPdf).to.be.deep.equal(signatureEmbederAssets.signedPdf);
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
