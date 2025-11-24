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
import { generateAsset, generatePdf17Async } from "../../test/_helpers";

import { expect } from "chai";

it("_generate", async function () {
  const pdf = await generatePdf17Async({ pageCount: 2 });
  await generateAsset.generateBinaryAsync(
    pdfDigitalSignerAssets.paths.pdf,
    pdf
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
      signature: {
        signatureLength: 4000 - 6,
        rangePlaceHolder: 9999999,
      },

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
      signature: {
        signatureLength: 4000 - 6,
        rangePlaceHolder: 9999999,
      },

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
