import { SignatureComputer } from './signature-computer';
import { P12SignatureComputerSettings, PemSignatureComputerSettings } from '../models/settings';

import { generatePdfAsync, generateAsset } from '../../test/_helpers';
import { signatureComputerAssets } from '../../test/_run-assets/signer/assets-signature-computer';

import { expect } from 'chai';

it('_generate', async function () {
    const pdf = await generatePdfAsync({ pageCount: 2 });
    await generateAsset.generateBinaryAsync(signatureComputerAssets.paths.pdf, pdf);
})

describe('SignatureComputer', function () {

    const pemSignatureComputerSettings: PemSignatureComputerSettings = {
        certificate: signatureComputerAssets.pemCertificate,
        key: signatureComputerAssets.pemKey,
        password: 'password'
    };
    const p12SignatureComputerSettings: P12SignatureComputerSettings = {
        certificate: signatureComputerAssets.p12Certificate,
        password: 'password'
    };
    const signDate: Date = new Date(2023, 1, 20, 18, 47, 35);

    const signatureComputer: SignatureComputer = new SignatureComputer(p12SignatureComputerSettings);

    describe('computeSignature', function() {
        it('computes signature', async function() {
            const signature = signatureComputer.computeSignature(signatureComputerAssets.pdf, signDate);

            await generateAsset.generateBinaryAsync(signatureComputerAssets.paths.signature, signature);
            expect(signature).to.be.deep.equal(signatureComputerAssets.signature);
        })

        it('computes different signature for different pdf', function() {
            const newPdf = Buffer.concat([ signatureComputerAssets.pdf, Buffer.from(' ') ]);

            const signature = signatureComputer.computeSignature(newPdf, signDate);

            expect(signature).to.not.be.deep.equal(signatureComputerAssets.signature);
        })

        it('!!!!! computes same signature for different date', function() {
            const newSignDate: Date = new Date(2023, 1, 20, 18, 47, 36);

            const signature = signatureComputer.computeSignature(signatureComputerAssets.pdf, newSignDate);

            expect(signature).to.be.deep.equal(signatureComputerAssets.signature);
        })

        it('computes signature for pem settings', function() {
            const newSignatureComputer: SignatureComputer = new SignatureComputer(pemSignatureComputerSettings);

            const signature = newSignatureComputer.computeSignature(signatureComputerAssets.pdf, signDate);

            expect(signature).to.be.deep.equal(signatureComputerAssets.signature);
        })

        it('computes signature for p12 settings', function() {
            const newSignatureComputer: SignatureComputer = new SignatureComputer(p12SignatureComputerSettings);

            const signature = newSignatureComputer.computeSignature(signatureComputerAssets.pdf, signDate);

            expect(signature).to.be.deep.equal(signatureComputerAssets.signature);
        })
    })
})
