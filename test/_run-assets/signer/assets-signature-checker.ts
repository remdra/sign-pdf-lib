import { transformPdfCheckResult } from '../../_helpers';
import { BinaryAssetFile, JsonAssetFile } from '../../_helpers/assets';

import * as path from 'path';

const baseFolder = path.join('test', '_assets', 'signer', 'signature-checker');

function getPath(file: string) {
  return path.join(baseFolder, file);
}

const _paths = {
  pdf:                        getPath('pdf.pdf'),
  fieldPdf:                   getPath('pdf-field.pdf'),
  signedFieldPdf:             getPath('pdf-field-signed.pdf'),
  signedPdf:                  getPath('pdf-signed.pdf'),
  twiceSignedPdf:             getPath('pdf-signed-twice.pdf'),
  tamperedSignedPdf:          getPath('pdf-signed-tampered.pdf'),
  onlyFirstTamperedSignedPdf: getPath('pdf-signed-tampered-only-first.pdf'),
  appendedTamperedSignedPdf:  getPath('pdf-signed-tampered-appended.pdf'),

  signedCheckResult:                  getPath('results-signed.json'),
  signedFieldCheckResult:             getPath('results-signed-field.json'),
  twiceSignedCheckResult:             getPath('results-signed-twice.json'),
  tamperedSignedCheckResult:          getPath('results-signed-tampered.json'),
  onlyFirstTamperedSignedCheckResult: getPath('results-signed-tampered-only-first.json'),
  appendedTamperedSignedCheckResult:  getPath('results-signed-tampered-appended.json'),
};

class SignatureCheckerAssets {
  
  private _pdf                        = new BinaryAssetFile(_paths.pdf);
  private _fieldPdf                   = new BinaryAssetFile(_paths.fieldPdf);
  private _signedFieldPdf             = new BinaryAssetFile(_paths.signedFieldPdf);
  private _signedPdf                  = new BinaryAssetFile(_paths.signedPdf);
  private _twiceSignedPdf             = new BinaryAssetFile(_paths.twiceSignedPdf);
  private _tamperedSignedPdf          = new BinaryAssetFile(_paths.tamperedSignedPdf);
  private _onlyFirstTamperedSignedPdf = new BinaryAssetFile(_paths.onlyFirstTamperedSignedPdf);
  private _appendedTamperedSignedPdf  = new BinaryAssetFile(_paths.appendedTamperedSignedPdf);

  private _signedCheckResult                  = new JsonAssetFile(_paths.signedCheckResult);
  private _signedFieldCheckResult             = new JsonAssetFile(_paths.signedFieldCheckResult);
  private _twiceSignedCheckResult             = new JsonAssetFile(_paths.twiceSignedCheckResult);
  private _tamperedSignedCheckResult          = new JsonAssetFile(_paths.tamperedSignedCheckResult);
  private _onlyFirstTamperedSignedCheckResult = new JsonAssetFile(_paths.onlyFirstTamperedSignedCheckResult);
  private _appendedTamperedSignedCheckResult  = new JsonAssetFile(_paths.appendedTamperedSignedCheckResult);
  
  public paths = {
    pdf:                        _paths.pdf,
    fieldPdf:                   _paths.fieldPdf,
    signedFieldPdf:             _paths.signedFieldPdf,
    signedPdf:                  _paths.signedPdf,
    twiceSignedPdf:             _paths.twiceSignedPdf,
    tamperedSignedPdf:          _paths.tamperedSignedPdf,
    onlyFirstTamperedSignedPdf: _paths.onlyFirstTamperedSignedPdf,
    appendedTamperedSignedPdf:  _paths.appendedTamperedSignedPdf,

    signedCheckResult:                  _paths.signedCheckResult,
    signedFieldCheckResult:             _paths.signedFieldCheckResult,
    twiceSignedCheckResult:             _paths.twiceSignedCheckResult,
    tamperedSignedCheckResult:          _paths.tamperedSignedCheckResult,
    onlyFirstTamperedSignedCheckResult: _paths.onlyFirstTamperedSignedCheckResult,
    appendedTamperedSignedCheckResult:  _paths.appendedTamperedSignedCheckResult
  }

  get pdf() {
    return this._pdf.content;
  }
  
  get fieldPdf() {
    return this._fieldPdf.content;
  }

  get signedFieldPdf() {
    return this._signedFieldPdf.content;
  }

  get signedPdf() {
    return this._signedPdf.content;
  }

  get twiceSignedPdf() {
    return this._twiceSignedPdf.content;
  }

  get tamperedSignedPdf() {
    return this._tamperedSignedPdf.content;
  }

  get onlyFirstTamperedSignedPdf() {
    return this._onlyFirstTamperedSignedPdf.content;
  }

  get appendedTamperedSignedPdf() {
    return this._appendedTamperedSignedPdf.content;
  }

  get signedCheckResult() {
    return transformPdfCheckResult(this._signedCheckResult.content);
  }

  get signedFieldCheckResult() {
    return transformPdfCheckResult(this._signedFieldCheckResult.content);
  }

  get twiceSignedCheckResult() {
    return transformPdfCheckResult(this._twiceSignedCheckResult.content);
  }

  get tamperedSignedCheckResult() {
    return transformPdfCheckResult(this._tamperedSignedCheckResult.content);
  }

  get onlyFirstTamperedSignedCheckResult() {
    return transformPdfCheckResult(this._onlyFirstTamperedSignedCheckResult.content);
  }

  get appendedTamperedSignedCheckResult() {
    return transformPdfCheckResult(this._appendedTamperedSignedCheckResult.content);
  }
};

export const signatureCheckerAssets = new SignatureCheckerAssets();
