import { SignDocument, AddSignatureFieldParameters } from "./new-sign-document";

import {
  generateAsset,
  generatePdfAsync,
} from "../../test/_helpers";
import { signDocumentAssets } from "../../test/_run-assets/signer/assets-sign-document";


import { expect } from "chai";

it("_generate", async function () {
  const pdf = await generatePdfAsync({ pageCount: 2 });
  await generateAsset.generateBinaryAsync(
    signDocumentAssets.paths.docPdf,
    pdf
  );
});

describe("SignDocument", function () {
  let signDoc: SignDocument;
  let addFieldParams: AddSignatureFieldParameters;

  beforeEach(async function () {
    addFieldParams = {
      name: "Signature",
      pageIndex: 0,
      pageRect: {
        left: 50,
        top: 100,
        right: 50 + 214,
        bottom: 100 + 70,
      }
    };

    signDoc = await SignDocument.fromPdfAsync(
      signDocumentAssets.docPdf
    );
  });

  describe("addSignatureField", function () {
    it("adds signature field", async function () {
      signDoc.addSignatureField(addFieldParams);
      const fieldPdf = await signDoc.saveAsync();

      await generateAsset.generateBinaryAsync(signDocumentAssets.paths.fieldPdf, fieldPdf);
      expect(fieldPdf).to.be.deep.equal(signDocumentAssets.fieldPdf);
    });

    it("adds signature field (page two)", async function () {
      addFieldParams.pageIndex = 1;

      signDoc.addSignatureField(addFieldParams);
      const pageTwoFieldPdf = await signDoc.saveAsync();

      await generateAsset.generateBinaryAsync(signDocumentAssets.paths.pageTwoFieldPdf, pageTwoFieldPdf);
      expect(pageTwoFieldPdf).to.be.deep.equal(signDocumentAssets.pageTwoFieldPdf);
    });
  });
});
