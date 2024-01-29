import { SignatureChecker } from './signature-checker';

import { generatePdfAsync, generateAsset, generateSignedPdfAsync, generateAppendTamperedPdfAsync, bufferReplace, generateTamperedPdfAsync, generateOnlyFirstTamperedPdfAsync, generateFieldPdfAsync, generateSignedFieldPdfAsync } from '../../test/_helpers';
import { signatureCheckerAssets } from '../../test/_run-assets/signer/assets-signature-checker';

import { expect } from 'chai';

it('_generate', async function () {
    const pdf = await generatePdfAsync({ pageCount: 2 });
    await generateAsset.generateBinaryAsync(signatureCheckerAssets.paths.pdf, pdf);

    const fieldPdf = await generateFieldPdfAsync(pdf);
    await generateAsset.generateBinaryAsync(signatureCheckerAssets.paths.fieldPdf, fieldPdf);

    const signedFieldPdf = await generateSignedFieldPdfAsync(fieldPdf);
    await generateAsset.generateBinaryAsync(signatureCheckerAssets.paths.signedFieldPdf, signedFieldPdf);

    const signedPdf = await generateSignedPdfAsync(pdf);
    await generateAsset.generateBinaryAsync(signatureCheckerAssets.paths.signedPdf, signedPdf);

    const twiceSignedPdf = await generateSignedPdfAsync(signedPdf, { name: 'Signature2' });
    await generateAsset.generateBinaryAsync(signatureCheckerAssets.paths.twiceSignedPdf, twiceSignedPdf);

    const tamperedSignedPdf = await generateTamperedPdfAsync(signedPdf);
    await generateAsset.generateBinaryAsync(signatureCheckerAssets.paths.tamperedSignedPdf, tamperedSignedPdf);

    const onlyFirstTamperedSignedPdf = await generateOnlyFirstTamperedPdfAsync(tamperedSignedPdf);
    await generateAsset.generateBinaryAsync(signatureCheckerAssets.paths.onlyFirstTamperedSignedPdf, onlyFirstTamperedSignedPdf);

    const appendedTamperedSignedPdf = await generateAppendTamperedPdfAsync(signedPdf);
    await generateAsset.generateBinaryAsync(signatureCheckerAssets.paths.appendedTamperedSignedPdf, appendedTamperedSignedPdf);

})

describe('SignatureChecker', function () {

    describe('verifySignaturesAsync', function() {
        it('returns undefined for no signatures', async function() {
            const signatureChecker = await SignatureChecker.fromPdfAsync(signatureCheckerAssets.pdf);
            
            const res = await signatureChecker.verifySignaturesAsync();
            expect(res).to.be.undefined;
        })

        it('returns for signature field', async function() {
            const signatureChecker = await SignatureChecker.fromPdfAsync(signatureCheckerAssets.fieldPdf);
            
            const res = await signatureChecker.verifySignaturesAsync();
            expect(res).to.be.deep.equal({ integrity: true, signatures: [ { isField: true, name: 'Signature' } ] });
        })

        it('returns for signed signature field', async function() {
            const signatureChecker = await SignatureChecker.fromPdfAsync(signatureCheckerAssets.signedFieldPdf);
            
            const res = await signatureChecker.verifySignaturesAsync();
            await generateAsset.generateJsonAsync(signatureCheckerAssets.paths.signedFieldCheckResult, res);
            expect(res).to.be.deep.equal(signatureCheckerAssets.signedFieldCheckResult);
        })
        
        it('validates one signature', async function() {
            const signatureChecker = await SignatureChecker.fromPdfAsync(signatureCheckerAssets.signedPdf);
            
            const res = await signatureChecker.verifySignaturesAsync();

            await generateAsset.generateJsonAsync(signatureCheckerAssets.paths.signedCheckResult, res);
            expect(res).to.be.deep.equal(signatureCheckerAssets.signedCheckResult);
        })

        it('validates two signatures', async function() {
            const signatureChecker = await SignatureChecker.fromPdfAsync(signatureCheckerAssets.twiceSignedPdf);
            
            const res = await signatureChecker.verifySignaturesAsync();

            await generateAsset.generateJsonAsync(signatureCheckerAssets.paths.twiceSignedCheckResult, res);
            expect(res).to.be.deep.equal(signatureCheckerAssets.twiceSignedCheckResult);
        })

        it('detects tampered signature', async function() {
            const signatureChecker = await SignatureChecker.fromPdfAsync(signatureCheckerAssets.tamperedSignedPdf);
            
            const res = await signatureChecker.verifySignaturesAsync();

            await generateAsset.generateJsonAsync(signatureCheckerAssets.paths.tamperedSignedCheckResult, res);
            expect(res).to.be.deep.equal(signatureCheckerAssets.tamperedSignedCheckResult);
        })

        it('detects only first tampered signature', async function() {
            const signatureChecker = await SignatureChecker.fromPdfAsync(signatureCheckerAssets.onlyFirstTamperedSignedPdf);
            
            const res = await signatureChecker.verifySignaturesAsync();

            await generateAsset.generateJsonAsync(signatureCheckerAssets.paths.onlyFirstTamperedSignedCheckResult, res);
            expect(res).to.be.deep.equal(signatureCheckerAssets.onlyFirstTamperedSignedCheckResult);
        })

        it('detects tampered appended pdf', async function() {
            const signatureChecker = await SignatureChecker.fromPdfAsync(signatureCheckerAssets.appendedTamperedSignedPdf);
            
            const res = await signatureChecker.verifySignaturesAsync();

            await generateAsset.generateJsonAsync(signatureCheckerAssets.paths.appendedTamperedSignedCheckResult, res);
            expect(res).to.be.deep.equal(signatureCheckerAssets.appendedTamperedSignedCheckResult);
        })
    })
})
