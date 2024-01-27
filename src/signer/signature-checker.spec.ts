import { SignatureChecker } from './signature-checker';

import { generatePdfAsync, generateAsset } from '../../test/_helpers';
import { signatureCheckerAssets } from '../../test/_run-assets/signer/assets-signature-checker';

import { expect } from 'chai';

it('_generate', async function () {
    const pdf = await generatePdfAsync({ pageCount: 2 });
    await generateAsset.generateBinaryAsync(signatureCheckerAssets.paths.pdf, pdf);
})

describe('SignatureChecker', function () {

    let signatureChecker: SignatureChecker ;
    
    beforeEach(async function () {
        signatureChecker = await SignatureChecker.fromPdfAsync(signatureCheckerAssets.pdf);
    })

    describe('computeSignature', function() {
        it('computes signature', async function() {
            //const signature = signatureComputer.computeSignature(signatureComputerAssets.pdf, signDate);

            //await generateAsset.generateBinaryAsync(signatureComputerAssets.paths.signature, signature);
            //expect(signature).to.be.deep.equal(signatureComputerAssets.signature);
        })
    })
})
