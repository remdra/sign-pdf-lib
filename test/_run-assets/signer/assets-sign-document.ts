import { BinaryAssetFile, JsonAssetFile, TextAssetFile } from '../../_helpers/assets';
import { commonAssets } from "../_assets-common";

import * as path from 'path';

const baseFolder = path.join('test', '_assets', 'signer', 'sign-document'); 

function getPath(file: string) {
  return path.join(baseFolder, file);
}

const _paths = {
  docPdf:                        getPath('doc.pdf'),
  fieldPdf:                      getPath('field.pdf'),
  pageTwoFieldPdf:               getPath('page-two-field.pdf'),
  twoFieldsPdf:                  getPath('two-fields.pdf'),
  placeholderPdf:                getPath('placeholder.pdf'),
  placeholderForFieldPdf:        getPath('placeholder-for-field.pdf'),
  placeholderForFieldMinimumPdf: getPath('placeholder-for-field-minimum.pdf'),
  placeholderOnlyPdf:            getPath('placeholder-only.pdf'),
  placeholderOnlyMinimumPdf:     getPath('placeholder-only-minimum.pdf'),
  signedPdf:                     getPath('signed.pdf'),

  placeholderBytes:              getPath('placeholder-bytes.bin'),
  hexStringSignature:            getPath('signature-hex-string.hex'),
  binarySignature:               getPath('signature-binary.bin')
};


class SignDocumentAssets {
  
  private _docPdf                        = new BinaryAssetFile(_paths.docPdf);
  private _fieldPdf                      = new BinaryAssetFile(_paths.fieldPdf);
  private _pageTwoFieldPdf               = new BinaryAssetFile(_paths.pageTwoFieldPdf);
  private _twoFieldsPdf                  = new BinaryAssetFile(_paths.twoFieldsPdf);
  private _placeholderPdf                = new BinaryAssetFile(_paths.placeholderPdf);
  private _placeholderForFieldPdf        = new BinaryAssetFile(_paths.placeholderForFieldPdf);
  private _placeholderForFieldMinimumPdf = new BinaryAssetFile(_paths.placeholderForFieldMinimumPdf);
  private _placeholderOnlyPdf            = new BinaryAssetFile(_paths.placeholderOnlyPdf);
  private _placeholderOnlyMinimumPdf     = new BinaryAssetFile(_paths.placeholderOnlyMinimumPdf);
  private _signedPdf                     = new BinaryAssetFile(_paths.signedPdf);

  private _placeholderBytes              = new BinaryAssetFile(_paths.placeholderBytes);
  private _hexStringSignature            = new TextAssetFile(_paths.hexStringSignature);
  private _binarySignature               = new TextAssetFile(_paths.binarySignature);
  
  public paths = {
    docPdf:                        _paths.docPdf,
    fieldPdf:                      _paths.fieldPdf,
    pageTwoFieldPdf:               _paths.pageTwoFieldPdf,
    twoFieldsPdf:                  _paths.twoFieldsPdf,
    placeholderPdf:                _paths.placeholderPdf,
    placeholderForFieldPdf:        _paths.placeholderForFieldPdf,
    placeholderForFieldMinimumPdf: _paths.placeholderForFieldMinimumPdf,
    placeholderOnlyPdf:            _paths.placeholderOnlyPdf,
    placeholderOnlyMinimumPdf:     _paths.placeholderOnlyMinimumPdf,
    signedPdf:                     _paths.signedPdf,

    placeholderBytes:   _paths.placeholderBytes,
    hexStringSignature: _paths.hexStringSignature,
    binarySignature:   _paths.binarySignature
  }

  get docPdf() {
    return this._docPdf.content;
  }

  get fieldPdf() {
    return this._fieldPdf.content;
  }

  get pageTwoFieldPdf() {
    return this._pageTwoFieldPdf.content;
  }

  get twoFieldsPdf() {
    return this._twoFieldsPdf.content;
  }

  get placeholderPdf() {
    return this._placeholderPdf.content;
  }

  get placeholderForFieldPdf() {
    return this._placeholderForFieldPdf.content;
  }

  get placeholderForFieldMinimumPdf() {
    return this._placeholderForFieldMinimumPdf.content;
  }

  get placeholderOnlyPdf() {
    return this._placeholderOnlyPdf.content;
  }

  get placeholderOnlyMinimumPdf() {
    return this._placeholderOnlyMinimumPdf.content;
  }

  get signedPdf() {
    return this._signedPdf.content;
  }

  get signatureBackground() {
    return commonAssets.pngImage;
  }

  get placeholderBytes() {
    return this._placeholderBytes.content;
  }

  get hexStringSignature() {
    return this._hexStringSignature.content;
  }

  get binarySignature() {
    return this._binarySignature.content;
  }
};

export const signDocumentAssets = new SignDocumentAssets();
