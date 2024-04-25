import {
  AddSignatureFieldParameters,
  AddSignaturePlaceholderParameters,
  AddVisualParameters,
  PdfDocumentDigitalSigner,
  UpdateSignatureParameters,
} from "./pdf-document-digital-signer";
import { AlreadySignedError } from "../errors";

import {
  generateAsset,
  generateFieldPdfAsync,
  generatePdfAsync,
  generatePlaceholderPdfAsync,
} from "../../test/_helpers";
import { pdfDocumentDigitalSignerAssets } from "../../test/_run-assets/signer/assets-pdf-document-digital-signer";

import { expect } from "chai";
import { PDFRef } from "pdf-lib";

it("_generate", async function () {
  const pdf = await generatePdfAsync({ pageCount: 2 });
  await generateAsset.generateBinaryAsync(
    pdfDocumentDigitalSignerAssets.paths.pdf,
    pdf
  );

  const placeholderPdf = await generatePlaceholderPdfAsync(pdf);
  await generateAsset.generateBinaryAsync(
    pdfDocumentDigitalSignerAssets.paths.realPlaceholderPdf,
    placeholderPdf
  );

  const fieldPdf = await generateFieldPdfAsync(pdf);
  await generateAsset.generateBinaryAsync(
    pdfDocumentDigitalSignerAssets.paths.realFieldPdf,
    fieldPdf
  );
});

describe("PdfDocumentDigitalSigner", function () {
  let pdfDocSigner: PdfDocumentDigitalSigner;
  let addFieldParameters: AddSignatureFieldParameters;
  let addVisualParameters: AddVisualParameters;
  let addPlaceholderParameters: AddSignaturePlaceholderParameters;
  let updateParameters: UpdateSignatureParameters;

  beforeEach(async function () {
    addFieldParameters = {
      name: "Signature",
      pageIndex: 0,
      rectangle: {
        left: 50,
        top: 100,
        right: 50 + 214,
        bottom: 100 + 70,
      },
      visualRef: PDFRef.of(170),
      placeholderRef: PDFRef.of(171),
      embedFont: true,
    };
    addVisualParameters = {
      background: pdfDocumentDigitalSignerAssets.visual,
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
    };
    addPlaceholderParameters = {
      name: "Test Signer",
      location: "Timisoara",
      reason: "Signing",
      date: new Date(2023, 1, 20, 18, 47, 35),
      contactInfo: "signer@semnezonline.ro",

      signaturePlaceholder: "A".repeat(4096),
      rangePlaceHolder: 9999,
    };
    updateParameters = {
      placeholderRef: PDFRef.of(180),
      visualRef: PDFRef.of(181),
      embedFont: true,
    };
    pdfDocSigner = await PdfDocumentDigitalSigner.fromPdfAsync(
      pdfDocumentDigitalSignerAssets.pdf
    );
  });

  describe("addSignatureField", function () {
    it("adds signature field", async function () {
      pdfDocSigner.addSignatureField(addFieldParameters);
      const fieldPdf = await pdfDocSigner.saveAsync();

      await generateAsset.generateBinaryAsync(
        pdfDocumentDigitalSignerAssets.paths.fieldPdf,
        fieldPdf
      );
      expect(fieldPdf).to.be.deep.equal(
        pdfDocumentDigitalSignerAssets.fieldPdf
      );
    });

    it("adds signature field (no name)", async function () {
      delete addFieldParameters.name;

      pdfDocSigner.addSignatureField(addFieldParameters);
      const noNameFieldPdf = await pdfDocSigner.saveAsync();

      await generateAsset.generateBinaryAsync(
        pdfDocumentDigitalSignerAssets.paths.noNameFieldPdf,
        noNameFieldPdf
      );
      expect(noNameFieldPdf).to.be.deep.equal(
        pdfDocumentDigitalSignerAssets.noNameFieldPdf
      );
    });

    it("adds signature field (no rectangle)", async function () {
      delete addFieldParameters.rectangle;

      pdfDocSigner.addSignatureField(addFieldParameters);
      const noRectangleFieldPdf = await pdfDocSigner.saveAsync();

      await generateAsset.generateBinaryAsync(
        pdfDocumentDigitalSignerAssets.paths.noRectangleFieldPdf,
        noRectangleFieldPdf
      );
      expect(noRectangleFieldPdf).to.be.deep.equal(
        pdfDocumentDigitalSignerAssets.noRectangleFieldPdf
      );
    });

    it("adds signature field (no visual ref)", async function () {
      delete addFieldParameters.visualRef;

      pdfDocSigner.addSignatureField(addFieldParameters);
      const noVisualRefFieldPdf = await pdfDocSigner.saveAsync();

      await generateAsset.generateBinaryAsync(
        pdfDocumentDigitalSignerAssets.paths.noVisualRefFieldPdf,
        noVisualRefFieldPdf
      );
      expect(noVisualRefFieldPdf).to.be.deep.equal(
        pdfDocumentDigitalSignerAssets.noVisualRefFieldPdf
      );
    });

    it("adds signature field (no placeholder ref)", async function () {
      delete addFieldParameters.placeholderRef;

      pdfDocSigner.addSignatureField(addFieldParameters);
      const noPlaceholderRefFieldPdf = await pdfDocSigner.saveAsync();

      await generateAsset.generateBinaryAsync(
        pdfDocumentDigitalSignerAssets.paths.noPlaceholderRefFieldPdf,
        noPlaceholderRefFieldPdf
      );
      expect(noPlaceholderRefFieldPdf).to.be.deep.equal(
        pdfDocumentDigitalSignerAssets.noPlaceholderRefFieldPdf
      );
    });

    it("adds signature field (no font)", async function () {
      addFieldParameters.embedFont = false;

      pdfDocSigner.addSignatureField(addFieldParameters);
      const noFontFieldPdf = await pdfDocSigner.saveAsync();

      await generateAsset.generateBinaryAsync(
        pdfDocumentDigitalSignerAssets.paths.noFontFieldPdf,
        noFontFieldPdf
      );
      expect(noFontFieldPdf).to.be.deep.equal(
        pdfDocumentDigitalSignerAssets.noFontFieldPdf
      );
    });

    it("adds signature field (no optionals)", async function () {
      delete addFieldParameters.name;
      delete addFieldParameters.rectangle;
      delete addFieldParameters.visualRef;
      delete addFieldParameters.placeholderRef;

      pdfDocSigner.addSignatureField(addFieldParameters);
      const noOptionalsFieldPdf = await pdfDocSigner.saveAsync();

      await generateAsset.generateBinaryAsync(
        pdfDocumentDigitalSignerAssets.paths.noOptionalsFieldPdf,
        noOptionalsFieldPdf
      );
      expect(noOptionalsFieldPdf).to.be.deep.equal(
        pdfDocumentDigitalSignerAssets.noOptionalsFieldPdf
      );
    });

    it("adds signature field (page two)", async function () {
      addFieldParameters.pageIndex = 1;

      pdfDocSigner.addSignatureField(addFieldParameters);
      const pageTwoFieldPdf = await pdfDocSigner.saveAsync();

      await generateAsset.generateBinaryAsync(
        pdfDocumentDigitalSignerAssets.paths.pageTwoFieldPdf,
        pageTwoFieldPdf
      );
      expect(pageTwoFieldPdf).to.be.deep.equal(
        pdfDocumentDigitalSignerAssets.pageTwoFieldPdf
      );
    });
  });

  describe("addVisualAsync", function () {
    it("adds visual", async function () {
      const visualRef = await pdfDocSigner.addVisualAsync(addVisualParameters);
      const visualPdf = await pdfDocSigner.saveAsync();

      expect(visualRef).to.not.be.undefined;
      await generateAsset.generateBinaryAsync(
        pdfDocumentDigitalSignerAssets.paths.visualPdf,
        visualPdf
      );
      expect(visualPdf).to.be.deep.equal(
        pdfDocumentDigitalSignerAssets.visualPdf
      );
    });

    it("adds visual (no background)", async function () {
      delete addVisualParameters.background;

      const visualRef = await pdfDocSigner.addVisualAsync(addVisualParameters);
      const noBackgroundVisualPdf = await pdfDocSigner.saveAsync();

      expect(visualRef).to.not.be.undefined;
      await generateAsset.generateBinaryAsync(
        pdfDocumentDigitalSignerAssets.paths.noBackgroundVisualPdf,
        noBackgroundVisualPdf
      );
      expect(noBackgroundVisualPdf).to.be.deep.equal(
        pdfDocumentDigitalSignerAssets.noBackgroundVisualPdf
      );
    });

    it("adds visual (no texts)", async function () {
      delete addVisualParameters.texts;

      const visualRef = await pdfDocSigner.addVisualAsync(addVisualParameters);
      const noTextsVisualPdf = await pdfDocSigner.saveAsync();

      expect(visualRef).to.not.be.undefined;
      await generateAsset.generateBinaryAsync(
        pdfDocumentDigitalSignerAssets.paths.noTextsVisualPdf,
        noTextsVisualPdf
      );
      expect(noTextsVisualPdf).to.be.deep.equal(
        pdfDocumentDigitalSignerAssets.noTextsVisualPdf
      );
    });

    it("adds visual (no optionals)", async function () {
      delete addVisualParameters.background;
      delete addVisualParameters.texts;

      const visualRef = await pdfDocSigner.addVisualAsync(addVisualParameters);
      const noOptionalsVisualPdf = await pdfDocSigner.saveAsync();

      expect(visualRef).to.be.undefined;
      await generateAsset.generateBinaryAsync(
        pdfDocumentDigitalSignerAssets.paths.noOptionalsVisualPdf,
        noOptionalsVisualPdf
      );
      expect(noOptionalsVisualPdf).to.be.deep.equal(
        pdfDocumentDigitalSignerAssets.noOptionalsVisualPdf
      );
    });
  });

  describe("addEmptyVisual", function () {
    it("adds empty visual", async function () {
      pdfDocSigner.addEmptyVisual();
      const emptyVisualPdf = await pdfDocSigner.saveAsync();

      await generateAsset.generateBinaryAsync(
        pdfDocumentDigitalSignerAssets.paths.emptyVisualPdf,
        emptyVisualPdf
      );
      expect(emptyVisualPdf).to.be.deep.equal(
        pdfDocumentDigitalSignerAssets.emptyVisualPdf
      );
    });
  });

  describe("addSignaturePlaceholder", function () {
    it("adds placeholder", async function () {
      const placeholderRef = await pdfDocSigner.addSignaturePlaceholder(
        addPlaceholderParameters
      );
      const placeholderPdf = await pdfDocSigner.saveAsync();

      expect(placeholderRef).to.not.be.undefined;
      await generateAsset.generateBinaryAsync(
        pdfDocumentDigitalSignerAssets.paths.placeholderPdf,
        placeholderPdf
      );
      expect(placeholderPdf).to.be.deep.equal(
        pdfDocumentDigitalSignerAssets.placeholderPdf
      );
    });

    it("adds placeholder (no name)", async function () {
      delete addPlaceholderParameters.name;

      const placeholderRef = await pdfDocSigner.addSignaturePlaceholder(
        addPlaceholderParameters
      );
      const noNamePlaceholderPdf = await pdfDocSigner.saveAsync();

      expect(placeholderRef).to.not.be.undefined;
      await generateAsset.generateBinaryAsync(
        pdfDocumentDigitalSignerAssets.paths.noNamePlaceholderPdf,
        noNamePlaceholderPdf
      );
      expect(noNamePlaceholderPdf).to.be.deep.equal(
        pdfDocumentDigitalSignerAssets.noNamePlaceholderPdf
      );
    });

    it("adds placeholder (no reason)", async function () {
      delete addPlaceholderParameters.reason;

      const placeholderRef = await pdfDocSigner.addSignaturePlaceholder(
        addPlaceholderParameters
      );
      const noReasonPlaceholderPdf = await pdfDocSigner.saveAsync();

      expect(placeholderRef).to.not.be.undefined;
      await generateAsset.generateBinaryAsync(
        pdfDocumentDigitalSignerAssets.paths.noReasonPlaceholderPdf,
        noReasonPlaceholderPdf
      );
      expect(noReasonPlaceholderPdf).to.be.deep.equal(
        pdfDocumentDigitalSignerAssets.noReasonPlaceholderPdf
      );
    });

    it("adds placeholder (no location)", async function () {
      delete addPlaceholderParameters.location;

      const placeholderRef = await pdfDocSigner.addSignaturePlaceholder(
        addPlaceholderParameters
      );
      const noLocationPlaceholderPdf = await pdfDocSigner.saveAsync();

      expect(placeholderRef).to.not.be.undefined;
      await generateAsset.generateBinaryAsync(
        pdfDocumentDigitalSignerAssets.paths.noLocationPlaceholderPdf,
        noLocationPlaceholderPdf
      );
      expect(noLocationPlaceholderPdf).to.be.deep.equal(
        pdfDocumentDigitalSignerAssets.noLocationPlaceholderPdf
      );
    });

    it("adds placeholder (no contact info)", async function () {
      delete addPlaceholderParameters.contactInfo;

      const placeholderRef = await pdfDocSigner.addSignaturePlaceholder(
        addPlaceholderParameters
      );
      const noContactInfoPlaceholderPdf = await pdfDocSigner.saveAsync();

      expect(placeholderRef).to.not.be.undefined;
      await generateAsset.generateBinaryAsync(
        pdfDocumentDigitalSignerAssets.paths.noContactInfoPlaceholderPdf,
        noContactInfoPlaceholderPdf
      );
      expect(noContactInfoPlaceholderPdf).to.be.deep.equal(
        pdfDocumentDigitalSignerAssets.noContactInfoPlaceholderPdf
      );
    });

    it("adds placeholder (no date)", async function () {
      delete addPlaceholderParameters.date;

      const placeholderRef = await pdfDocSigner.addSignaturePlaceholder(
        addPlaceholderParameters
      );
      const noDatePlaceholderPdf = await pdfDocSigner.saveAsync();

      expect(placeholderRef).to.not.be.undefined;
      await generateAsset.generateBinaryAsync(
        pdfDocumentDigitalSignerAssets.paths.noDatePlaceholderPdf,
        noDatePlaceholderPdf
      );
      expect(noDatePlaceholderPdf).to.be.deep.equal(
        pdfDocumentDigitalSignerAssets.noDatePlaceholderPdf
      );
    });

    it("adds placeholder (no optionals)", async function () {
      delete addPlaceholderParameters.name;
      delete addPlaceholderParameters.reason;
      delete addPlaceholderParameters.location;
      delete addPlaceholderParameters.contactInfo;
      delete addPlaceholderParameters.date;

      const placeholderRef = await pdfDocSigner.addSignaturePlaceholder(
        addPlaceholderParameters
      );
      const noOptionalsPlaceholderPdf = await pdfDocSigner.saveAsync();

      expect(placeholderRef).to.not.be.undefined;
      await generateAsset.generateBinaryAsync(
        pdfDocumentDigitalSignerAssets.paths.noOptionalsPlaceholderPdf,
        noOptionalsPlaceholderPdf
      );
      expect(noOptionalsPlaceholderPdf).to.be.deep.equal(
        pdfDocumentDigitalSignerAssets.noOptionalsPlaceholderPdf
      );
    });

    it("adds placeholder for different settings", async function () {
      (addPlaceholderParameters.signaturePlaceholder = "A".repeat(5000)),
        (addPlaceholderParameters.rangePlaceHolder = 9999);

      const placeholderRef = await pdfDocSigner.addSignaturePlaceholder(
        addPlaceholderParameters
      );
      const differentSettingsPlaceholderPdf = await pdfDocSigner.saveAsync();

      expect(placeholderRef).to.not.be.undefined;
      await generateAsset.generateBinaryAsync(
        pdfDocumentDigitalSignerAssets.paths.differentSettingsPlaceholderPdf,
        differentSettingsPlaceholderPdf
      );
      expect(differentSettingsPlaceholderPdf).to.be.deep.equal(
        pdfDocumentDigitalSignerAssets.differentSettingsPlaceholderPdf
      );
      expect(differentSettingsPlaceholderPdf).to.not.be.deep.equal(
        pdfDocumentDigitalSignerAssets.placeholderPdf
      );
    });
  });

  describe("updateSignature", function () {
    beforeEach(async function () {
      pdfDocSigner = await PdfDocumentDigitalSigner.fromPdfAsync(
        pdfDocumentDigitalSignerAssets.realFieldPdf
      );
    });

    it("updates signature", async function () {
      pdfDocSigner.updateSignature("Signature", updateParameters);
      const updatePdf = await pdfDocSigner.saveAsync();

      await generateAsset.generateBinaryAsync(
        pdfDocumentDigitalSignerAssets.paths.updatePdf,
        updatePdf
      );
      expect(updatePdf).to.be.deep.equal(
        pdfDocumentDigitalSignerAssets.updatePdf
      );
    });

    it("updates signature (no visual ref)", async function () {
      delete updateParameters.visualRef;

      pdfDocSigner.updateSignature("Signature", updateParameters);
      const noVisualRefUpdatePdf = await pdfDocSigner.saveAsync();

      await generateAsset.generateBinaryAsync(
        pdfDocumentDigitalSignerAssets.paths.noVisualRefUpdatePdf,
        noVisualRefUpdatePdf
      );
      expect(noVisualRefUpdatePdf).to.be.deep.equal(
        pdfDocumentDigitalSignerAssets.noVisualRefUpdatePdf
      );
    });

    it("updates signature (no font)", async function () {
      updateParameters.embedFont = false;

      pdfDocSigner.updateSignature("Signature", updateParameters);
      const noFontUpdatePdf = await pdfDocSigner.saveAsync();

      await generateAsset.generateBinaryAsync(
        pdfDocumentDigitalSignerAssets.paths.noFontUpdatePdf,
        noFontUpdatePdf
      );
      expect(noFontUpdatePdf).to.be.deep.equal(
        pdfDocumentDigitalSignerAssets.noFontUpdatePdf
      );
    });

    it("updates signature (no optionals)", async function () {
      delete updateParameters.visualRef;

      pdfDocSigner.updateSignature("Signature", updateParameters);
      const noOptionalsUpdatedPdf = await pdfDocSigner.saveAsync();

      await generateAsset.generateBinaryAsync(
        pdfDocumentDigitalSignerAssets.paths.noOptionalsUpdatedPdf,
        noOptionalsUpdatedPdf
      );
      expect(noOptionalsUpdatedPdf).to.be.deep.equal(
        pdfDocumentDigitalSignerAssets.noOptionalsUpdatedPdf
      );
    });

    it("throws for already signed pdf", async function () {
      pdfDocSigner = await PdfDocumentDigitalSigner.fromPdfAsync(
        pdfDocumentDigitalSignerAssets.updatePdf
      );

      expect(() =>
        pdfDocSigner.updateSignature("Signature", updateParameters)
      ).to.throw(AlreadySignedError);
    });
  });

  describe("saveAsync", function () {
    it("saves pdf", async function () {
      const savePdf = await pdfDocSigner.saveAsync();

      await generateAsset.generateBinaryAsync(
        pdfDocumentDigitalSignerAssets.paths.savePdf,
        savePdf
      );
      expect(savePdf).to.be.deep.equal(pdfDocumentDigitalSignerAssets.savePdf);
    });
  });

  describe("getPlaceholderRanges", function () {
    it("returns placeholder ranges", async function () {
      pdfDocSigner = await PdfDocumentDigitalSigner.fromPdfAsync(
        pdfDocumentDigitalSignerAssets.realPlaceholderPdf
      );

      const ranges = await pdfDocSigner.getPlaceholderRanges();

      await generateAsset.generateJsonAsync(
        pdfDocumentDigitalSignerAssets.paths.ranges,
        ranges
      );
      expect(ranges).to.be.deep.equal(pdfDocumentDigitalSignerAssets.ranges);
    });
  });
});
