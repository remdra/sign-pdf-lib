import { transformPdfCheckResult } from "../../_helpers/check-result-helpers";
import { BinaryAssetFile } from "../../_helpers/assets/binary-asset-file";
import { JsonAssetFile } from "../../_helpers/assets/json-asset-file";
import { commonAssets } from "../_assets-common";

import * as path from "path";

const baseFolder = path.join("test", "_assets", "signer", "pdf-digital-signer");

function getPath(file: string) {
  return path.join(baseFolder, file);
}

function getFieldPath(file: string) {
  return path.join(baseFolder, "field", file);
}

function getPlaceholderPath(file: string) {
  return path.join(baseFolder, "placeholder", file);
}

function getSignedPath(file: string) {
  return path.join(baseFolder, "sign", file);
}

function getFieldSignedPath(file: string) {
  return path.join(baseFolder, "sign-field", file);
}

function getCheckPath(file: string) {
  return path.join(baseFolder, "check", file);
}

const _paths = {
  pdf: getPath("document.pdf"),

  placeholderPdf: getPlaceholderPath("placeholder.pdf"),

  fieldPdf: getFieldPath("field.pdf"),

  signedPdf: getSignedPath("signed.pdf"),
  chineseSignedPdf: getSignedPath("signed-chinese.pdf"),
  twiceSignedPdf: getSignedPath("signed-twice.pdf"),
  noNameSignedPdf: getSignedPath("signed-no-name.pdf"),
  noSignatureSignedPdf: getSignedPath("signed-no-signature.pdf"),
  noVisualSignedPdf: getSignedPath("signed-no-visual.pdf"),
  noOptionalsSignedPdf: getSignedPath("signed-no-optionals.pdf"),

  fieldSignedPdf: getFieldSignedPath("signed.pdf"),
  noSignatureFieldSignedPdf: getFieldSignedPath("signed-no-signature.pdf"),
  noVisualFieldSignedPdf: getFieldSignedPath("signed-no-visual.pdf"),
  noOptionalsFieldSignedPdf: getFieldSignedPath("signed-no-optionals.pdf"),
  specifiedFieldSignedPdf: getFieldSignedPath("signed-specific-field.pdf"),

  checkSignedPdf: getCheckPath("check-signed.json"),
};

class PdfDigitalSignerAssets {
  private _pdf = new BinaryAssetFile(_paths.pdf);

  private _placeholderPdf = new BinaryAssetFile(_paths.placeholderPdf);

  private _fieldPdf = new BinaryAssetFile(_paths.fieldPdf);

  private _signedPdf = new BinaryAssetFile(_paths.signedPdf);
  private _chineseSignedPdf = new BinaryAssetFile(_paths.chineseSignedPdf);
  private _twiceSignedPdf = new BinaryAssetFile(_paths.twiceSignedPdf);
  private _noNameSignedPdf = new BinaryAssetFile(_paths.noNameSignedPdf);
  private _noSignatureSignedPdf = new BinaryAssetFile(
    _paths.noSignatureSignedPdf
  );
  private _noVisualSignedPdf = new BinaryAssetFile(_paths.noVisualSignedPdf);
  private _noOptionalsSignedPdf = new BinaryAssetFile(
    _paths.noOptionalsSignedPdf
  );

  private _fieldSignedPdf = new BinaryAssetFile(_paths.fieldSignedPdf);
  private _noSignatureFieldSignedPdf = new BinaryAssetFile(
    _paths.noSignatureFieldSignedPdf
  );
  private _noVisualFieldSignedPdf = new BinaryAssetFile(
    _paths.noVisualFieldSignedPdf
  );
  private _noOptionalsFieldSignedPdf = new BinaryAssetFile(
    _paths.noOptionalsFieldSignedPdf
  );
  private _specifiedFieldSignedPdf = new BinaryAssetFile(
    _paths.specifiedFieldSignedPdf
  );

  private _checkSignedPdf = new JsonAssetFile(_paths.checkSignedPdf);

  public paths = {
    pdf: _paths.pdf,

    placeholderPdf: _paths.placeholderPdf,

    fieldPdf: _paths.fieldPdf,

    signedPdf: _paths.signedPdf,
    chineseSignedPdf: _paths.chineseSignedPdf,
    twiceSignedPdf: _paths.twiceSignedPdf,
    noNameSignedPdf: _paths.noNameSignedPdf,
    noSignatureSignedPdf: _paths.noSignatureSignedPdf,
    noVisualSignedPdf: _paths.noVisualSignedPdf,
    noOptionalsSignedPdf: _paths.noOptionalsSignedPdf,

    fieldSignedPdf: _paths.fieldSignedPdf,
    noSignatureFieldSignedPdf: _paths.noSignatureFieldSignedPdf,
    noVisualFieldSignedPdf: _paths.noVisualFieldSignedPdf,
    noOptionalsFieldSignedPdf: _paths.noOptionalsFieldSignedPdf,

    checkSignedPdf: _paths.checkSignedPdf,
  };

  get pdf() {
    return this._pdf.content;
  }

  get placeholderPdf() {
    return this._placeholderPdf.content;
  }

  get fieldPdf() {
    return this._fieldPdf.content;
  }

  get signedPdf() {
    return this._signedPdf.content;
  }

  get chineseSignedPdf() {
    return this._chineseSignedPdf.content;
  }

  get noNameSignedPdf() {
    return this._noNameSignedPdf.content;
  }

  get noSignatureSignedPdf() {
    return this._noSignatureSignedPdf.content;
  }

  get noVisualSignedPdf() {
    return this._noVisualSignedPdf.content;
  }

  get noOptionalsSignedPdf() {
    return this._noOptionalsSignedPdf.content;
  }

  get fieldSignedPdf() {
    return this._fieldSignedPdf.content;
  }

  get noSignatureFieldSignedPdf() {
    return this._noSignatureFieldSignedPdf.content;
  }

  get noVisualFieldSignedPdf() {
    return this._noVisualFieldSignedPdf.content;
  }

  get noOptionalsFieldSignedPdf() {
    return this._noOptionalsFieldSignedPdf.content;
  }

  get twiceSignedPdf() {
    return this._twiceSignedPdf.content;
  }

  get checkSignedPdf() {
    return transformPdfCheckResult(this._checkSignedPdf.content);
  }

  get specifiedFieldSignedPdf() {
    return this._specifiedFieldSignedPdf.content;
  }

  get signatureImage() {
    return commonAssets.pngImage;
  }
}

export const pdfDigitalSignerAssets = new PdfDigitalSignerAssets();
