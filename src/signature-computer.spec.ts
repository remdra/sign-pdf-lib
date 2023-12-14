import { SignatureComputer } from './signature-computer';
import { P12SignatureComputerSettings, PemSignatureComputerSettings } from './models/settings/signature-computer-settings';

import { generatePdfLibPdfAsync } from '../test/_helpers/pdf-helpers';
import { generateAsset } from '../test/_helpers/generate-asset';
import { settingsAssets } from '../test/_run-assets/signature-computer/assets-settings';
import { computerAssets } from '../test/_run-assets/signature-computer/assets-computer';

import { expect } from 'chai';

describe('SignatureComputer', function () {

    const pemSignatureComputerSettings: PemSignatureComputerSettings = {
        certificate: settingsAssets.pemCertificate,
        key: settingsAssets.pemKey,
        password: 'password'
    };
    const p12SignatureComputerSettings: P12SignatureComputerSettings = {
        certificate: settingsAssets.p12Certificate,
        password: 'password'
    };
    const signDate: Date = new Date(2023, 1, 20, 18, 47, 35);

    const signatureComputer: SignatureComputer = new SignatureComputer(p12SignatureComputerSettings);

    it('_generate', async function () {
        const pdf = await generatePdfLibPdfAsync();
        await generateAsset.generateBinaryAsync(computerAssets.paths.pdf, pdf);
    })

    describe('computeSignature', function() {
        it('computes signature', async function() {
            const signature = signatureComputer.computeSignature(computerAssets.pdf, signDate);

            await generateAsset.generateBinaryAsync(computerAssets.paths.signature, signature);
            expect(signature).to.be.deep.equal(computerAssets.signature);
        })

        it('computes different signature for different pdf', function() {
            const newPdf = Buffer.concat([ computerAssets.pdf, Buffer.from(' ') ]);

            const signature = signatureComputer.computeSignature(newPdf, signDate);

            expect(signature).to.not.be.deep.equal(computerAssets.signature);
        })

        it('!!!!! computes same signature for different date', function() {
            const newSignDate: Date = new Date(2023, 1, 20, 18, 47, 36);

            const signature = signatureComputer.computeSignature(computerAssets.pdf, newSignDate);

            expect(signature).to.be.deep.equal(computerAssets.signature);
        })

        it('computes signature for pem settings', function() {
            const newSignatureComputer: SignatureComputer = new SignatureComputer(pemSignatureComputerSettings);

            const signature = newSignatureComputer.computeSignature(computerAssets.pdf, signDate);

            expect(signature).to.be.deep.equal(computerAssets.signature);
        })

        it('computes signature for p12 settings', function() {
            const newSignatureComputer: SignatureComputer = new SignatureComputer(p12SignatureComputerSettings);

            const signature = newSignatureComputer.computeSignature(computerAssets.pdf, signDate);

            expect(signature).to.be.deep.equal(computerAssets.signature);
        })
    })
})
