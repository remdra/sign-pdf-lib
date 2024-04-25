import { transformPdfCheckResult } from "../../_helpers/check-result-helpers";
import { BinaryAssetFile } from "../../_helpers/assets/binary-asset-file";
import { JsonAssetFile } from "../../_helpers/assets/json-asset-file";
import { commonAssets } from "../_assets-common";

import * as path from "path";

const baseFolder = path.join("test", "_assets", "signer", "pdf-helper");

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

function getCheckPath(file: string) {
  return path.join(baseFolder, "check", file);
}

const _paths = {
  pdf: getPath("document.pdf"),

  placeholderPdf: getPlaceholderPath("placeholder.pdf"),
  noNamePlaceholderPdf: getPlaceholderPath("placeholder-no-name.pdf"),
  noSignaturePlaceholderPdf: getPlaceholderPath("placeholder-no-signature.pdf"),
  noVisualPlaceholderPdf: getPlaceholderPath("placeholder-no-visual.pdf"),
  noOptionalsPlaceholderPdf: getPlaceholderPath("placeholder-no-optionals.pdf"),

  fieldPdf: getFieldPath("field.pdf"),
  noNameFieldPdf: getFieldPath("field-no-name.pdf"),
  noOptionalsFieldPdf: getFieldPath("field-no-optionals.pdf"),

  signedPdf: getSignedPath("signed.pdf"),

  checkSignedPdf: getCheckPath("check-signed.json"),
};

class PdfHelperAssets {
  private _pdf = new BinaryAssetFile(_paths.pdf);

  private _placeholderPdf = new BinaryAssetFile(_paths.placeholderPdf);
  private _noNamePlaceholderPdf = new BinaryAssetFile(
    _paths.noNamePlaceholderPdf
  );
  private _noSignaturePlaceholderPdf = new BinaryAssetFile(
    _paths.noSignaturePlaceholderPdf
  );
  private _noVisualPlaceholderPdf = new BinaryAssetFile(
    _paths.noVisualPlaceholderPdf
  );
  private _noOptionalsPlaceholderPdf = new BinaryAssetFile(
    _paths.noOptionalsPlaceholderPdf
  );

  private _fieldPdf = new BinaryAssetFile(_paths.fieldPdf);
  private _noNameFieldPdf = new BinaryAssetFile(_paths.noNameFieldPdf);
  private _noOptionalsFieldPdf = new BinaryAssetFile(
    _paths.noOptionalsFieldPdf
  );

  private _signedPdf = new BinaryAssetFile(_paths.signedPdf);

  private _checkSignedPdf = new JsonAssetFile(_paths.checkSignedPdf);

  public paths = {
    pdf: _paths.pdf,

    placeholderPdf: _paths.placeholderPdf,

    noNamePlaceholderPdf: _paths.noNamePlaceholderPdf,
    noSignaturePlaceholderPdf: _paths.noSignaturePlaceholderPdf,
    noVisualPlaceholderPdf: _paths.noVisualPlaceholderPdf,
    noOptionalsPlaceholderPdf: _paths.noOptionalsPlaceholderPdf,

    fieldPdf: _paths.fieldPdf,
    noNameFieldPdf: _paths.noNameFieldPdf,
    noOptionalsFieldPdf: _paths.noOptionalsFieldPdf,

    signedPdf: _paths.signedPdf,

    checkSignedPdf: _paths.checkSignedPdf,
  };

  get pdf() {
    return this._pdf.content;
  }

  get placeholderPdf() {
    return this._placeholderPdf.content;
  }

  get noNamePlaceholderPdf() {
    return this._noNamePlaceholderPdf.content;
  }

  get noSignaturePlaceholderPdf() {
    return this._noSignaturePlaceholderPdf.content;
  }

  get noVisualPlaceholderPdf() {
    return this._noVisualPlaceholderPdf.content;
  }

  get noOptionalsPlaceholderPdf() {
    return this._noOptionalsPlaceholderPdf.content;
  }

  get fieldPdf() {
    return this._fieldPdf.content;
  }

  get noNameFieldPdf() {
    return this._noNameFieldPdf.content;
  }

  get noOptionalsFieldPdf() {
    return this._noOptionalsFieldPdf.content;
  }

  get signedPdf() {
    return this._signedPdf.content;
  }

  get checkSignedPdf() {
    return transformPdfCheckResult(this._checkSignedPdf.content);
  }

  get signatureImage() {
    return commonAssets.pngImage;
  }
}

export const pdfHelperAssets = new PdfHelperAssets();
