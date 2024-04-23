import { PdfDigitalSigner } from "./pdf-digital-signer";
import {
  SignDigitalParameters,
  SignFieldParameters,
  AddFieldParameters,
} from "../models/parameters";
import { SignerSettings } from "../models/settings";

import { pdfDigitalSignerAssets } from "../../test/_run-assets/signer/assets-pdf-digital-signer-pdf";
import { pdfDigitalSignerAssetsRegression } from "../../test/_run-assets/signer/assets-pdf-digital-signer-regression";
import { commonAssets } from "../../test/_run-assets/_assets-common";
import {
  generateAsset,
  generatePdf13Async,
  generatePdf17Async,
} from "../../test/_helpers";

import { use as chaiUse } from "chai";
import { expect } from "chai";

const chaiAsPromised = require("chai-as-promised");
chaiUse(chaiAsPromised);

it("_generate", async function () {
  const pdf = await generatePdf17Async({ pageCount: 2 });
  await generateAsset.generateBinaryAsync(
    pdfDigitalSignerAssets.paths.pdf,
    pdf
  );

  const reverseYPdf = await generatePdf13Async({ pageCount: 2 });
  await generateAsset.generateBinaryAsync(
    pdfDigitalSignerAssets.paths.reverseYPdf,
    reverseYPdf
  );
});

describe("PdfDigitalSigner", function () {
  let pdfSigner: PdfDigitalSigner;
  let info: SignDigitalParameters;
  let fieldInfo: SignFieldParameters;
  let addFieldInfo: AddFieldParameters;
  let settings: SignerSettings;

  beforeEach(function () {
    info = {
      pageNumber: 1,
      name: "Signature",

      signature: {
        name: "Test Signer",
        location: "Timisoara",
        reason: "Signing",
        date: new Date(2023, 1, 20, 18, 47, 35),
        contactInfo: "signer@semnezonline.ro",
      },
      visual: {
        rectangle: { left: 50, top: 100, right: 50 + 214, bottom: 100 + 70 },
        background: pdfDigitalSignerAssets.signatureImage,
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
    };

    fieldInfo = {
      fieldName: "Signature",

      signature: {
        name: "Test Signer",
        location: "Timisoara",
        reason: "Signing",
        date: new Date(2023, 1, 20, 18, 47, 35),
        contactInfo: "signer@semnezonline.ro",
      },
      visual: {
        background: pdfDigitalSignerAssets.signatureImage,
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
    };

    addFieldInfo = {
      pageNumber: 1,
      name: "Signature",
      rectangle: { left: 50, top: 100, right: 50 + 214, bottom: 100 + 70 },
    };

    settings = {
      signatureLength: 4000 - 6,
      rangePlaceHolder: 9999999,

      signatureComputer: {
        certificate: commonAssets.p12Certificate,
        password: "password",
      },
    };
    pdfSigner = new PdfDigitalSigner(settings);
  });

  describe("addPlaceholderAsync", function () {
    it("adds placeholder", async function () {
      const placeholderPdf = await pdfSigner.addPlaceholderAsync(
        pdfDigitalSignerAssets.pdf,
        info
      );

      await generateAsset.generateBinaryAsync(
        pdfDigitalSignerAssets.paths.placeholderPdf,
        placeholderPdf
      );
      expect(placeholderPdf).to.be.deep.equal(
        pdfDigitalSignerAssets.placeholderPdf
      );
    });

    it("adds placeholder (no name)", async function () {
      delete info.name;

      const noNamePlaceholderPdf = await pdfSigner.addPlaceholderAsync(
        pdfDigitalSignerAssets.pdf,
        info
      );

      await generateAsset.generateBinaryAsync(
        pdfDigitalSignerAssets.paths.noNamePlaceholderPdf,
        noNamePlaceholderPdf
      );
      expect(noNamePlaceholderPdf).to.be.deep.equal(
        pdfDigitalSignerAssets.noNamePlaceholderPdf
      );
    });

    it("adds placeholder (no signature)", async function () {
      delete info.signature;

      const noSignaturePlaceholderPdf = await pdfSigner.addPlaceholderAsync(
        pdfDigitalSignerAssets.pdf,
        info
      );

      await generateAsset.generateBinaryAsync(
        pdfDigitalSignerAssets.paths.noSignaturePlaceholderPdf,
        noSignaturePlaceholderPdf
      );
      expect(noSignaturePlaceholderPdf).to.be.deep.equal(
        pdfDigitalSignerAssets.noSignaturePlaceholderPdf
      );
    });

    it("adds placeholder (no visual)", async function () {
      delete info.visual;

      const noVisualPlaceholderPdf = await pdfSigner.addPlaceholderAsync(
        pdfDigitalSignerAssets.pdf,
        info
      );

      await generateAsset.generateBinaryAsync(
        pdfDigitalSignerAssets.paths.noVisualPlaceholderPdf,
        noVisualPlaceholderPdf
      );
      expect(noVisualPlaceholderPdf).to.be.deep.equal(
        pdfDigitalSignerAssets.noVisualPlaceholderPdf
      );
    });

    it("adds placeholder (no optionals)", async function () {
      delete info.name;
      delete info.signature;
      delete info.visual;

      const noOptionalsPlaceholderPdf = await pdfSigner.addPlaceholderAsync(
        pdfDigitalSignerAssets.pdf,
        info
      );

      await generateAsset.generateBinaryAsync(
        pdfDigitalSignerAssets.paths.noOptionalsPlaceholderPdf,
        noOptionalsPlaceholderPdf
      );
      expect(noOptionalsPlaceholderPdf).to.be.deep.equal(
        pdfDigitalSignerAssets.noOptionalsPlaceholderPdf
      );
    });
  });

  describe("addFieldAsync", function () {
    it("adds field", async function () {
      const fieldPdf = await pdfSigner.addFieldAsync(
        pdfDigitalSignerAssets.pdf,
        addFieldInfo
      );

      await generateAsset.generateBinaryAsync(
        pdfDigitalSignerAssets.paths.fieldPdf,
        fieldPdf
      );
      expect(fieldPdf).to.be.deep.equal(pdfDigitalSignerAssets.fieldPdf);
    });

    it("adds field (no name)", async function () {
      delete addFieldInfo.name;

      const noNameFieldPdf = await pdfSigner.addFieldAsync(
        pdfDigitalSignerAssets.pdf,
        addFieldInfo
      );

      await generateAsset.generateBinaryAsync(
        pdfDigitalSignerAssets.paths.noNameFieldPdf,
        noNameFieldPdf
      );
      expect(noNameFieldPdf).to.be.deep.equal(
        pdfDigitalSignerAssets.noNameFieldPdf
      );
    });

    it("adds field (no optionals)", async function () {
      delete addFieldInfo.name;

      const noOptionalsFieldPdf = await pdfSigner.addFieldAsync(
        pdfDigitalSignerAssets.pdf,
        addFieldInfo
      );

      await generateAsset.generateBinaryAsync(
        pdfDigitalSignerAssets.paths.noOptionalsFieldPdf,
        noOptionalsFieldPdf
      );
      expect(noOptionalsFieldPdf).to.be.deep.equal(
        pdfDigitalSignerAssets.noOptionalsFieldPdf
      );
    });
  });

  describe("signAsync", function () {
    it("signs document", async function () {
      const signedPdf = await pdfSigner.signAsync(
        pdfDigitalSignerAssets.pdf,
        info
      );

      await generateAsset.generateBinaryAsync(
        pdfDigitalSignerAssets.paths.signedPdf,
        signedPdf
      );
      expect(signedPdf).to.be.deep.equal(pdfDigitalSignerAssets.signedPdf);
    });

    it("signs document (chinese characters)", async function () {
      info.signature!.name = "小白";
      info.signature!.location = "哈哈哈";
      info.signature!.reason = "我同意";

      const signedPdf = await pdfSigner.signAsync(
        pdfDigitalSignerAssets.pdf,
        info
      );

      await generateAsset.generateBinaryAsync(
        pdfDigitalSignerAssets.paths.chineseSignedPdf,
        signedPdf
      );
      expect(signedPdf).to.be.deep.equal(
        pdfDigitalSignerAssets.chineseSignedPdf
      );
    });

    it("signs document (no name)", async function () {
      delete info.name;

      const noNameSignedPdf = await pdfSigner.signAsync(
        pdfDigitalSignerAssets.pdf,
        info
      );

      await generateAsset.generateBinaryAsync(
        pdfDigitalSignerAssets.paths.noNameSignedPdf,
        noNameSignedPdf
      );
      expect(noNameSignedPdf).to.be.deep.equal(
        pdfDigitalSignerAssets.noNameSignedPdf
      );
    });

    it("signs document (no signature)", async function () {
      delete info.signature;

      const noSignatureSignedPdf = await pdfSigner.signAsync(
        pdfDigitalSignerAssets.pdf,
        info
      );

      await generateAsset.generateBinaryAsync(
        pdfDigitalSignerAssets.paths.noSignatureSignedPdf,
        noSignatureSignedPdf
      );
      expect(noSignatureSignedPdf).to.be.deep.equal(
        pdfDigitalSignerAssets.noSignatureSignedPdf
      );
    });

    it("signs document (no visual)", async function () {
      delete info.visual;

      const noVisualSignedPdf = await pdfSigner.signAsync(
        pdfDigitalSignerAssets.pdf,
        info
      );

      await generateAsset.generateBinaryAsync(
        pdfDigitalSignerAssets.paths.noVisualSignedPdf,
        noVisualSignedPdf
      );
      expect(noVisualSignedPdf).to.be.deep.equal(
        pdfDigitalSignerAssets.noVisualSignedPdf
      );
    });

    it("signs document (no optionals)", async function () {
      delete info.name;
      delete info.signature;
      delete info.visual;

      const noOptionalsSignedPdf = await pdfSigner.signAsync(
        pdfDigitalSignerAssets.pdf,
        info
      );

      await generateAsset.generateBinaryAsync(
        pdfDigitalSignerAssets.paths.noOptionalsSignedPdf,
        noOptionalsSignedPdf
      );
      expect(noOptionalsSignedPdf).to.be.deep.equal(
        pdfDigitalSignerAssets.noOptionalsSignedPdf
      );
    });

    it("signs already signed document", async function () {
      info.name = "Signature2";
      const res = await pdfSigner.signAsync(
        pdfDigitalSignerAssets.signedPdf,
        info
      );

      await generateAsset.generateBinaryAsync(
        pdfDigitalSignerAssets.paths.twiceSignedPdf,
        res
      );
      expect(res).to.be.deep.equal(pdfDigitalSignerAssets.twiceSignedPdf);
    });
  });

  describe("signFieldAsync", function () {
    it("signs document", async function () {
      const fieldSignedPdf = await pdfSigner.signFieldAsync(
        pdfDigitalSignerAssets.fieldPdf,
        fieldInfo
      );

      await generateAsset.generateBinaryAsync(
        pdfDigitalSignerAssets.paths.fieldSignedPdf,
        fieldSignedPdf
      );
      expect(fieldSignedPdf).to.be.deep.equal(
        pdfDigitalSignerAssets.fieldSignedPdf
      );
    });

    it("signs document (no signature)", async function () {
      delete fieldInfo.signature;

      const noSignatureFieldSignedPdf = await pdfSigner.signFieldAsync(
        pdfDigitalSignerAssets.fieldPdf,
        fieldInfo
      );

      await generateAsset.generateBinaryAsync(
        pdfDigitalSignerAssets.paths.noSignatureFieldSignedPdf,
        noSignatureFieldSignedPdf
      );
      expect(noSignatureFieldSignedPdf).to.be.deep.equal(
        pdfDigitalSignerAssets.noSignatureFieldSignedPdf
      );
    });

    it("signs document (no visual)", async function () {
      delete fieldInfo.visual;

      const noVisualFieldSignedPdf = await pdfSigner.signFieldAsync(
        pdfDigitalSignerAssets.fieldPdf,
        fieldInfo
      );

      await generateAsset.generateBinaryAsync(
        pdfDigitalSignerAssets.paths.noVisualFieldSignedPdf,
        noVisualFieldSignedPdf
      );
      expect(noVisualFieldSignedPdf).to.be.deep.equal(
        pdfDigitalSignerAssets.noVisualFieldSignedPdf
      );
    });

    it("signs document (no optionals)", async function () {
      delete fieldInfo.signature;
      delete fieldInfo.visual;

      const noOptionalsFieldSignedPdf = await pdfSigner.signFieldAsync(
        pdfDigitalSignerAssets.fieldPdf,
        fieldInfo
      );

      await generateAsset.generateBinaryAsync(
        pdfDigitalSignerAssets.paths.noOptionalsFieldSignedPdf,
        noOptionalsFieldSignedPdf
      );
      expect(noOptionalsFieldSignedPdf).to.be.deep.equal(
        pdfDigitalSignerAssets.noOptionalsFieldSignedPdf
      );
    });

    it("signs specified field", async function () {
      addFieldInfo.rectangle.left += 250;
      addFieldInfo.rectangle.right += 250;
      addFieldInfo.name = "Signature2";
      const twoFieldsPdf = await pdfSigner.addFieldAsync(
        pdfDigitalSignerAssets.fieldPdf,
        addFieldInfo
      );

      fieldInfo.fieldName = "Signature2";

      const specifiedFieldSignedPdf = await pdfSigner.signFieldAsync(
        twoFieldsPdf,
        fieldInfo
      );

      await generateAsset.generateBinaryAsync(
        pdfDigitalSignerAssets.paths.specifiedFieldSignedPdf,
        specifiedFieldSignedPdf
      );
      expect(specifiedFieldSignedPdf).to.be.deep.equal(
        pdfDigitalSignerAssets.specifiedFieldSignedPdf
      );
    });

    it("throws when field not found", async function () {
      fieldInfo.fieldName = "Another name";

      await expect(
        pdfSigner.signFieldAsync(pdfDigitalSignerAssets.fieldPdf, fieldInfo)
      ).to.be.rejected;
    });
  });

  describe("verifySignaturesAsync", function () {
    it("validates signatures", async function () {
      const res = await pdfSigner.verifySignaturesAsync(
        pdfDigitalSignerAssets.signedPdf
      );

      await generateAsset.generateJsonAsync(
        pdfDigitalSignerAssets.paths.checkSignedPdf,
        res
      );
      expect(res).to.be.deep.equal(pdfDigitalSignerAssets.checkSignedPdf);
    });
  });

  describe("getFieldsAsync", function () {
    it("returns fields", async function () {
      const res = await pdfSigner.getFieldsAsync(
        pdfDigitalSignerAssets.fieldPdf
      );
      expect(res).to.be.deep.equal([{ name: "Signature", pageNumber: 1 }]);
    });
  });
});

describe("PdfDigitalSigner Regression", function () {
  let pdfSigner: PdfDigitalSigner;
  let fieldInfo: SignFieldParameters;
  let settings: SignerSettings;

  beforeEach(function () {
    fieldInfo = {
      fieldName: "Signature1",

      signature: {
        name: "Test Signer",
        location: "Timisoara",
        reason: "Signing",
        date: new Date(2023, 1, 20, 18, 47, 35),
        contactInfo: "signer@semnezonline.ro",
      },
      visual: {
        background: pdfDigitalSignerAssets.signatureImage,
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
    };

    settings = {
      signatureLength: 4000 - 6,
      rangePlaceHolder: 9999999,

      signatureComputer: {
        certificate: commonAssets.p12Certificate,
        password: "password",
      },
    };
    pdfSigner = new PdfDigitalSigner(settings);
  });

  it("signs field", async function () {
    fieldInfo.fieldName = "Signature28";

    const signed = await pdfSigner.signFieldAsync(
      pdfDigitalSignerAssetsRegression.fieldPdf,
      fieldInfo
    );

    await generateAsset.generateBinaryAsync(
      pdfDigitalSignerAssetsRegression.paths.fieldSignedPdf,
      signed
    );
    expect(signed).to.be.deep.equal(
      pdfDigitalSignerAssetsRegression.fieldSignedPdf
    );

    const fields = await pdfSigner.getFieldsAsync(
      pdfDigitalSignerAssetsRegression.fieldPdf
    );
    expect(fields).to.be.deep.equal([{ name: "Signature28", pageNumber: 9 }]);
  });

  it("check signatures", async function () {
    const checkResult = await pdfSigner.verifySignaturesAsync(
      pdfDigitalSignerAssetsRegression.verifySignaturesPdf
    );

    await generateAsset.generateJsonAsync(
      pdfDigitalSignerAssetsRegression.paths.checkResult,
      checkResult
    );
    expect(checkResult).to.be.deep.equal(
      pdfDigitalSignerAssetsRegression.checkResult
    );
  });
});
