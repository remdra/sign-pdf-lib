import {
  addFieldAsync,
  addPlaceholderAsync,
  getFieldsAsync,
  verifySignaturesAsync,
} from "./pdf-helper";
import {
  SignDigitalParameters,
  AddFieldParameters,
} from "../models/parameters";
import { SignatureSettings } from "../models/settings";

import { pdfHelperAssets } from "../../test/_run-assets/signer/assets-pdf-helper-pdf";
import {
  generateAsset,
  generatePdf17Async,
  generateSignedPdfAsync,
} from "../../test/_helpers";

import { use as chaiUse } from "chai";
import { expect } from "chai";

const chaiAsPromised = require("chai-as-promised");
chaiUse(chaiAsPromised);

it("_generate", async function () {
  const pdf = await generatePdf17Async({ pageCount: 2 });
  await generateAsset.generateBinaryAsync(pdfHelperAssets.paths.pdf, pdf);

  const signedPdf = await generateSignedPdfAsync(pdf);
  await generateAsset.generateBinaryAsync(
    pdfHelperAssets.paths.signedPdf,
    signedPdf
  );
});

describe("addPlaceholderAsync", function () {
  let info: SignDigitalParameters;
  let signatureInfo: SignatureSettings;

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
        background: pdfHelperAssets.signatureImage,
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

    signatureInfo = {
      signatureLength: 4000 - 6,
      rangePlaceHolder: 9999999,
    };
  });

  it("adds placeholder", async function () {
    const placeholderPdf = await addPlaceholderAsync(
      pdfHelperAssets.pdf,
      info,
      signatureInfo
    );

    await generateAsset.generateBinaryAsync(
      pdfHelperAssets.paths.placeholderPdf,
      placeholderPdf
    );
    expect(placeholderPdf).to.be.deep.equal(pdfHelperAssets.placeholderPdf);
  });

  it("adds placeholder (no name)", async function () {
    delete info.name;

    const noNamePlaceholderPdf = await addPlaceholderAsync(
      pdfHelperAssets.pdf,
      info,
      signatureInfo
    );

    await generateAsset.generateBinaryAsync(
      pdfHelperAssets.paths.noNamePlaceholderPdf,
      noNamePlaceholderPdf
    );
    expect(noNamePlaceholderPdf).to.be.deep.equal(
      pdfHelperAssets.noNamePlaceholderPdf
    );
  });

  it("adds placeholder (no signature)", async function () {
    delete info.signature;

    const noSignaturePlaceholderPdf = await addPlaceholderAsync(
      pdfHelperAssets.pdf,
      info,
      signatureInfo
    );

    await generateAsset.generateBinaryAsync(
      pdfHelperAssets.paths.noSignaturePlaceholderPdf,
      noSignaturePlaceholderPdf
    );
    expect(noSignaturePlaceholderPdf).to.be.deep.equal(
      pdfHelperAssets.noSignaturePlaceholderPdf
    );
  });

  it("adds placeholder (no visual)", async function () {
    delete info.visual;

    const noVisualPlaceholderPdf = await addPlaceholderAsync(
      pdfHelperAssets.pdf,
      info,
      signatureInfo
    );

    await generateAsset.generateBinaryAsync(
      pdfHelperAssets.paths.noVisualPlaceholderPdf,
      noVisualPlaceholderPdf
    );
    expect(noVisualPlaceholderPdf).to.be.deep.equal(
      pdfHelperAssets.noVisualPlaceholderPdf
    );
  });

  it("adds placeholder (no optionals)", async function () {
    delete info.name;
    delete info.signature;
    delete info.visual;

    const noOptionalsPlaceholderPdf = await addPlaceholderAsync(
      pdfHelperAssets.pdf,
      info,
      signatureInfo
    );

    await generateAsset.generateBinaryAsync(
      pdfHelperAssets.paths.noOptionalsPlaceholderPdf,
      noOptionalsPlaceholderPdf
    );
    expect(noOptionalsPlaceholderPdf).to.be.deep.equal(
      pdfHelperAssets.noOptionalsPlaceholderPdf
    );
  });
});

describe("addFieldAsync", function () {
  let addFieldInfo: AddFieldParameters;

  beforeEach(function () {
    addFieldInfo = {
      pageNumber: 1,
      name: "Signature",
      rectangle: { left: 50, top: 100, right: 50 + 214, bottom: 100 + 70 },
    };
  });

  it("adds field", async function () {
    const fieldPdf = await addFieldAsync(pdfHelperAssets.pdf, addFieldInfo);

    await generateAsset.generateBinaryAsync(
      pdfHelperAssets.paths.fieldPdf,
      fieldPdf
    );
    expect(fieldPdf).to.be.deep.equal(pdfHelperAssets.fieldPdf);
  });

  it("adds field (no name)", async function () {
    delete addFieldInfo.name;

    const noNameFieldPdf = await addFieldAsync(
      pdfHelperAssets.pdf,
      addFieldInfo
    );

    await generateAsset.generateBinaryAsync(
      pdfHelperAssets.paths.noNameFieldPdf,
      noNameFieldPdf
    );
    expect(noNameFieldPdf).to.be.deep.equal(pdfHelperAssets.noNameFieldPdf);
  });

  it("adds field (no optionals)", async function () {
    delete addFieldInfo.name;

    const noOptionalsFieldPdf = await addFieldAsync(
      pdfHelperAssets.pdf,
      addFieldInfo
    );

    await generateAsset.generateBinaryAsync(
      pdfHelperAssets.paths.noOptionalsFieldPdf,
      noOptionalsFieldPdf
    );
    expect(noOptionalsFieldPdf).to.be.deep.equal(
      pdfHelperAssets.noOptionalsFieldPdf
    );
  });
});

describe("verifySignaturesAsync", function () {
  it("validates signatures", async function () {
    const res = await verifySignaturesAsync(pdfHelperAssets.signedPdf);

    await generateAsset.generateJsonAsync(
      pdfHelperAssets.paths.checkSignedPdf,
      res
    );
    expect(res).to.be.deep.equal(pdfHelperAssets.checkSignedPdf);
  });
});

describe("getFieldsAsync", function () {
  it("returns fields", async function () {
    const res = await getFieldsAsync(pdfHelperAssets.fieldPdf);
    expect(res).to.be.deep.equal([{ name: "Signature", pageNumber: 1 }]);
  });
});
