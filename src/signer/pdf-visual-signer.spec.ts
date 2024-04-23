import { PdfVisualSigner } from "./pdf-visual-signer";
import { SignVisualParameters } from "../models/parameters";

import { pdfVisualSignerAssets } from "../../test/_run-assets/signer/assets-pdf-visual-signer-pdf";
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
  await generateAsset.generateBinaryAsync(pdfVisualSignerAssets.paths.pdf, pdf);

  const reverseYPdf = await generatePdf13Async({ pageCount: 2 });
  await generateAsset.generateBinaryAsync(
    pdfVisualSignerAssets.paths.reverseYPdf,
    reverseYPdf
  );
});

describe("PdfVisualSigner", function () {
  let pdfSigner: PdfVisualSigner;
  let visualInfo: SignVisualParameters;

  beforeEach(function () {
    visualInfo = {
      pageNumber: 1,

      rectangle: { left: 50, top: 100, right: 50 + 214, bottom: 100 + 70 },
      background: pdfVisualSignerAssets.signatureImage,
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

      // @ts-ignore
      backgroundName: "background1",
    };

    pdfSigner = new PdfVisualSigner();
  });

  describe("signAsync", function () {
    it("signs document", async function () {
      const visualSignedPdf = await pdfSigner.signAsync(
        pdfVisualSignerAssets.pdf,
        visualInfo
      );

      await generateAsset.generateBinaryAsync(
        pdfVisualSignerAssets.paths.visualSignedPdf,
        visualSignedPdf
      );
      expect(visualSignedPdf).to.be.deep.equal(
        pdfVisualSignerAssets.visualSignedPdf
      );
    });

    it("signs document (reverseY)", async function () {
      visualInfo.reverseY = true;

      const visualSignedReverseYPdf = await pdfSigner.signAsync(
        pdfVisualSignerAssets.reverseYPdf,
        visualInfo
      );

      await generateAsset.generateBinaryAsync(
        pdfVisualSignerAssets.paths.visualSignedReverseYPdf,
        visualSignedReverseYPdf
      );
      expect(visualSignedReverseYPdf).to.be.deep.equal(
        pdfVisualSignerAssets.visualSignedReverseYPdf
      );
    });

    it("signs document (no background)", async function () {
      delete visualInfo.background;

      const noBackgroundVisualSignedPdf = await pdfSigner.signAsync(
        pdfVisualSignerAssets.pdf,
        visualInfo
      );

      await generateAsset.generateBinaryAsync(
        pdfVisualSignerAssets.paths.noBackgroundVisualSignedPdf,
        noBackgroundVisualSignedPdf
      );
      expect(noBackgroundVisualSignedPdf).to.be.deep.equal(
        pdfVisualSignerAssets.noBackgroundVisualSignedPdf
      );
    });

    it("signs document (no texts)", async function () {
      delete visualInfo.texts;

      const noTextsVisualSignedPdf = await pdfSigner.signAsync(
        pdfVisualSignerAssets.pdf,
        visualInfo
      );

      await generateAsset.generateBinaryAsync(
        pdfVisualSignerAssets.paths.noTextsVisualSignedPdf,
        noTextsVisualSignedPdf
      );
      expect(noTextsVisualSignedPdf).to.be.deep.equal(
        pdfVisualSignerAssets.noTextsVisualSignedPdf
      );
    });

    it("signs document (no optionals)", async function () {
      delete visualInfo.background;
      delete visualInfo.texts;

      const noOptionalsVisualSignedPdf = await pdfSigner.signAsync(
        pdfVisualSignerAssets.pdf,
        visualInfo
      );

      await generateAsset.generateBinaryAsync(
        pdfVisualSignerAssets.paths.noOptionalsVisualSignedPdf,
        noOptionalsVisualSignedPdf
      );
      expect(noOptionalsVisualSignedPdf).to.be.deep.equal(
        pdfVisualSignerAssets.noOptionalsVisualSignedPdf
      );
    });
  });
});
