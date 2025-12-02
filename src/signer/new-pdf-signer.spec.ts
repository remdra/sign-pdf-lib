import { SignDocument, SignaturePlaceholderParameters } from "./new-pdf-signer";

import {
  generateAsset,
  generatePdfAsync,
} from "../../test/_helpers";
import { signDocumentAssets } from "../../test/_run-assets/signer/assets-sign-document";


import { expect } from "chai";
import { SignatureFieldParameters } from "src/models/parameters";

it.skip("_generate", async function () {
  const pdf = await generatePdfAsync({ pageCount: 2 });
  await generateAsset.generateBinaryAsync(
    signDocumentAssets.paths.docPdf,
    pdf
  );
});

describe.skip("SignDocument", function () {
  let signDoc: SignDocument;
  let fieldParams: SignatureFieldParameters;
  let placeholderParams: SignaturePlaceholderParameters;

  beforeEach(async function () {
    fieldParams = {
      name: "Signature",
      pageIndex: 0,
      pageRect: {
        left: 50,
        top: 741.89,
        right: 264,
        bottom: 671.89,
      }
    };

    placeholderParams = { 
      ...fieldParams,
      info: {
        name: 'Test Signer',
        location: 'Timisoara',
        reason: 'Signing',
        date: new Date(2023, 1, 20, 18, 47, 35),
        contactInfo: 'signer@semnezonline.ro'
      },
      visual: {
        background: {
          image: signDocumentAssets.signatureBackground,
          imageName: 'background1',
          frmName: 'frm1'
        },
        texts: [
          {
            lines: ["JOHN", "DOE"],
          },
          {
            lines: [
              "Digitally signed by",
              "JOHN DOE",
              "Date: 2023.11.03",
              "20:28:46 +02'00'",
            ],
          },
        ],   
      },
      placeholder: {
        signatureMaxLen: 4096,
        offsetMaxLen: 5
      }
    }

    signDoc = await SignDocument.fromPdfAsync(
      signDocumentAssets.docPdf
    );
  });

  describe("addField", function () {
    it("adds signature field", async function () {
      signDoc.addField(fieldParams);
      const fieldPdf = await signDoc.saveAsync();

      await generateAsset.generateBinaryAsync(signDocumentAssets.paths.fieldPdf, fieldPdf);
      expect(fieldPdf).to.be.deep.equal(signDocumentAssets.fieldPdf);
    });

    it("adds signature field (page two)", async function () {
      fieldParams.pageIndex = 1;

      signDoc.addField(fieldParams);
      const pageTwoFieldPdf = await signDoc.saveAsync();

      await generateAsset.generateBinaryAsync(signDocumentAssets.paths.pageTwoFieldPdf, pageTwoFieldPdf);
      expect(pageTwoFieldPdf).to.be.deep.equal(signDocumentAssets.pageTwoFieldPdf);
    });

    it("adds multiple signature fields", async function () {
      signDoc.addField(fieldParams);
      fieldParams.name = 'Signature2';
      fieldParams.pageRect.left += 300;
      fieldParams.pageRect.right += 300;
      signDoc.addField(fieldParams);
      const twoFieldsPdf = await signDoc.saveAsync();

      await generateAsset.generateBinaryAsync(signDocumentAssets.paths.twoFieldsPdf, twoFieldsPdf);
      expect(twoFieldsPdf).to.be.deep.equal(signDocumentAssets.twoFieldsPdf);
    });


  });

  describe("addPlaceholderAsync", function () {
    it("adds signature placeholder", async function () {
      await signDoc.addPlaceholderAsync(placeholderParams);
      const placeholderPdf = await signDoc.saveAsync();

      await generateAsset.generateBinaryAsync(signDocumentAssets.paths.placeholderPdf, placeholderPdf);
      expect(placeholderPdf).to.be.deep.equal(signDocumentAssets.placeholderPdf);
    });
  });

  describe('getPdfBytesForThePlaceholder', function() {
    it('returns placeholder bytes', async function() {
      signDoc = await SignDocument.fromPdfAsync(signDocumentAssets.placeholderPdf);
  
      const placeholderBytes = signDoc.getPdfBytesForThePlaceholder();
  
      await generateAsset.generateBinaryAsync(signDocumentAssets.paths.placeholderBytes, placeholderBytes);
      expect(placeholderBytes).to.be.deep.equal(signDocumentAssets.placeholderBytes);
    })
  })

  describe('embedSignatureAsync', function() {
    it('embeds signature', async function() {
      signDoc = await SignDocument.fromPdfAsync(signDocumentAssets.placeholderPdf);

      await signDoc.embedSignatureAsync(signDocumentAssets.hexStringSignature);

      const signedPdf = await signDoc.saveAsync();
      await generateAsset.generateBinaryAsync(signDocumentAssets.paths.signedPdf, signedPdf);
      expect(signedPdf).to.be.deep.equal(signDocumentAssets.signedPdf);
    })
  })
});
