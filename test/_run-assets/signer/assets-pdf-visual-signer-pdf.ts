import { BinaryAssetFile } from "../../_helpers/assets/binary-asset-file";
import { commonAssets } from "../_assets-common";

import * as path from "path";

const baseFolder = path.join("test", "_assets", "signer", "pdf-visual-signer");

function getPath(file: string) {
  return path.join(baseFolder, file);
}

function getVisualSignedPath(file: string) {
  return path.join(baseFolder, "sign-visual", file);
}

const _paths = {
  pdf: getPath("document.pdf"),
  reverseYPdf: getPath("document-reverse-y.pdf"),

  visualSignedPdf: getVisualSignedPath("signed.pdf"),
  visualSignedReverseYPdf: getVisualSignedPath("signed-reverse-y.pdf"),
  noBackgroundVisualSignedPdf: getVisualSignedPath("signed-no-background.pdf"),
  noTextsVisualSignedPdf: getVisualSignedPath("signed-no-texts.pdf"),
  noOptionalsVisualSignedPdf: getVisualSignedPath("signed-no-optionals.pdf"),
};

class PdfVisualSignerAssets {
  private _pdf = new BinaryAssetFile(_paths.pdf);
  private _reverseYPdf = new BinaryAssetFile(_paths.reverseYPdf);

  private _visualSignedPdf = new BinaryAssetFile(_paths.visualSignedPdf);
  private _visualSignedReverseYPdf = new BinaryAssetFile(
    _paths.visualSignedReverseYPdf
  );
  private _noBackgroundVisualSignedPdf = new BinaryAssetFile(
    _paths.noBackgroundVisualSignedPdf
  );
  private _noTextsVisualSignedPdf = new BinaryAssetFile(
    _paths.noTextsVisualSignedPdf
  );
  private _noOptionalsVisualSignedPdf = new BinaryAssetFile(
    _paths.noOptionalsVisualSignedPdf
  );

  public paths = {
    pdf: _paths.pdf,
    reverseYPdf: _paths.reverseYPdf,

    visualSignedPdf: _paths.visualSignedPdf,
    visualSignedReverseYPdf: _paths.visualSignedReverseYPdf,
    noBackgroundVisualSignedPdf: _paths.noBackgroundVisualSignedPdf,
    noTextsVisualSignedPdf: _paths.noTextsVisualSignedPdf,
    noOptionalsVisualSignedPdf: _paths.noOptionalsVisualSignedPdf,
  };

  get pdf() {
    return this._pdf.content;
  }

  get reverseYPdf() {
    return this._reverseYPdf.content;
  }

  get noBackgroundVisualSignedPdf() {
    return this._noBackgroundVisualSignedPdf.content;
  }

  get noTextsVisualSignedPdf() {
    return this._noTextsVisualSignedPdf.content;
  }

  get noOptionalsVisualSignedPdf() {
    return this._noOptionalsVisualSignedPdf.content;
  }

  get visualSignedPdf() {
    return this._visualSignedPdf.content;
  }

  get visualSignedReverseYPdf() {
    return this._visualSignedReverseYPdf.content;
  }

  get signatureImage() {
    return commonAssets.pngImage;
  }
}

export const pdfVisualSignerAssets = new PdfVisualSignerAssets();
