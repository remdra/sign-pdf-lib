import { transformPdfCheckResult } from '../../_helpers/check-result-helpers';
import { BinaryAssetFile } from '../../_helpers/assets/binary-asset-file';
import { JsonAssetFile } from '../../_helpers/assets/json-asset-file';
import { commonAssets } from '../_assets-common';

import * as path from 'path';

const baseFolder = path.join('test', '_assets', 'signer', 'pdf-signer'); 

function getPath(file: string) {
  return path.join(baseFolder, file);
}

function getFieldPath(file: string) {
  return path.join(baseFolder, 'field', file);
}

function getPlaceholderPath(file: string) {
  return path.join(baseFolder, 'placeholder', file);
}

function getSignedPath(file: string) {
  return path.join(baseFolder, 'sign', file);
}

function getFieldSignedPath(file: string) {
  return path.join(baseFolder, 'sign-field', file);
}

function getVisualSignedPath(file: string) {
  return path.join(baseFolder, 'sign-visual', file);
}

function getCheckPath(file: string) {
  return path.join(baseFolder, 'check', file);
}


const _paths = {
  pdf:        getPath('document.pdf'),
  reverseYPdf: getPath('document-reverse-y.pdf'),

  placeholderPdf:            getPlaceholderPath('placeholder.pdf'),
  noNamePlaceholderPdf:      getPlaceholderPath('placeholder-no-name.pdf'),
  noSignaturePlaceholderPdf: getPlaceholderPath('placeholder-no-signature.pdf'),
  noVisualPlaceholderPdf:    getPlaceholderPath('placeholder-no-visual.pdf'),
  noOptionalsPlaceholderPdf: getPlaceholderPath('placeholder-no-optionals.pdf'),
  differentPlaceholderPdf:   getPlaceholderPath('placeholder-different.pdf'),
  
  fieldPdf:            getFieldPath('field.pdf'),
  noNameFieldPdf:      getFieldPath('field-no-name.pdf'),
  noOptionalsFieldPdf: getFieldPath('field-no-optionals.pdf'),

  signedPdf:            getSignedPath('signed.pdf'),
  chineseSignedPdf:     getSignedPath('signed-chinese.pdf'),
  twiceSignedPdf:       getSignedPath('signed-twice.pdf'),
  noNameSignedPdf:      getSignedPath('signed-no-name.pdf'),
  noSignatureSignedPdf: getSignedPath('signed-no-signature.pdf'),
  noVisualSignedPdf:    getSignedPath('signed-no-visual.pdf'),
  noOptionalsSignedPdf: getSignedPath('signed-no-optionals.pdf'),

  fieldSignedPdf:            getFieldSignedPath('signed.pdf'),
  noSignatureFieldSignedPdf: getFieldSignedPath('signed-no-signature.pdf'),
  noVisualFieldSignedPdf:    getFieldSignedPath('signed-no-visual.pdf'),
  noOptionalsFieldSignedPdf: getFieldSignedPath('signed-no-optionals.pdf'),
  specifiedFieldSignedPdf:   getFieldSignedPath('signed-specific-field.pdf'),

  visualSignedPdf:             getVisualSignedPath('signed.pdf'),
  visualSignedReverseYPdf:     getVisualSignedPath('signed-reverse-y.pdf'),
  noBackgroundVisualSignedPdf: getVisualSignedPath('signed-no-background.pdf'),
  noTextsVisualSignedPdf:      getVisualSignedPath('signed-no-texts.pdf'),
  noOptionalsVisualSignedPdf:  getVisualSignedPath('signed-no-optionals.pdf'),

  checkSignedPdf: getCheckPath('check-signed.json')
};


class PdfSignerAssets {
  
  private _pdf         = new BinaryAssetFile(_paths.pdf);
  private _reverseYPdf = new BinaryAssetFile(_paths.reverseYPdf);

  private _placeholderPdf = new BinaryAssetFile(_paths.placeholderPdf);
  private _noNamePlaceholderPdf = new BinaryAssetFile(_paths.noNamePlaceholderPdf);
  private _noSignaturePlaceholderPdf = new BinaryAssetFile(_paths.noSignaturePlaceholderPdf);
  private _noVisualPlaceholderPdf = new BinaryAssetFile(_paths.noVisualPlaceholderPdf);
  private _noOptionalsPlaceholderPdf = new BinaryAssetFile(_paths.noOptionalsPlaceholderPdf);
  private _differentPlaceholderPdf = new BinaryAssetFile(_paths.differentPlaceholderPdf);

  private _fieldPdf            = new BinaryAssetFile(_paths.fieldPdf);
  private _noNameFieldPdf      = new BinaryAssetFile(_paths.noNameFieldPdf);
  private _noOptionalsFieldPdf = new BinaryAssetFile(_paths.noOptionalsFieldPdf);

  private _signedPdf            = new BinaryAssetFile(_paths.signedPdf);
  private _chineseSignedPdf     = new BinaryAssetFile(_paths.chineseSignedPdf);
  private _twiceSignedPdf       = new BinaryAssetFile(_paths.twiceSignedPdf);
  private _noNameSignedPdf      = new BinaryAssetFile(_paths.noNameSignedPdf);
  private _noSignatureSignedPdf = new BinaryAssetFile(_paths.noSignatureSignedPdf);
  private _noVisualSignedPdf    = new BinaryAssetFile(_paths.noVisualSignedPdf);
  private _noOptionalsSignedPdf = new BinaryAssetFile(_paths.noOptionalsSignedPdf);

  private _fieldSignedPdf            = new BinaryAssetFile(_paths.fieldSignedPdf);
  private _noSignatureFieldSignedPdf = new BinaryAssetFile(_paths.noSignatureFieldSignedPdf);
  private _noVisualFieldSignedPdf    = new BinaryAssetFile(_paths.noVisualFieldSignedPdf);
  private _noOptionalsFieldSignedPdf = new BinaryAssetFile(_paths.noOptionalsFieldSignedPdf);
  private _specifiedFieldSignedPdf = new BinaryAssetFile(_paths.specifiedFieldSignedPdf);

  private _visualSignedPdf             = new BinaryAssetFile(_paths.visualSignedPdf);
  private _visualSignedReverseYPdf     = new BinaryAssetFile(_paths.visualSignedReverseYPdf);
  private _noBackgroundVisualSignedPdf = new BinaryAssetFile(_paths.noBackgroundVisualSignedPdf);
  private _noTextsVisualSignedPdf      = new BinaryAssetFile(_paths.noTextsVisualSignedPdf);
  private _noOptionalsVisualSignedPdf  = new BinaryAssetFile(_paths.noOptionalsVisualSignedPdf);

  private _checkSignedPdf = new JsonAssetFile(_paths.checkSignedPdf);

  public paths = {
    pdf:         _paths.pdf,
    reverseYPdf: _paths.reverseYPdf,
  
    placeholderPdf: _paths.placeholderPdf,
  
    noNamePlaceholderPdf: _paths.noNamePlaceholderPdf,
    noSignaturePlaceholderPdf: _paths.noSignaturePlaceholderPdf,
    noVisualPlaceholderPdf: _paths.noVisualPlaceholderPdf,
    noOptionalsPlaceholderPdf: _paths.noOptionalsPlaceholderPdf,
    differentPlaceholderPdf:   _paths.differentPlaceholderPdf,

    fieldPdf:                _paths.fieldPdf,
    noNameFieldPdf:          _paths.noNameFieldPdf,
    noOptionalsFieldPdf:     _paths.noOptionalsFieldPdf,
    specifiedFieldSignedPdf: _paths.specifiedFieldSignedPdf,

    signedPdf:            _paths.signedPdf,
    chineseSignedPdf:     _paths.chineseSignedPdf,
    twiceSignedPdf:       _paths.twiceSignedPdf,
    noNameSignedPdf:      _paths.noNameSignedPdf,
    noSignatureSignedPdf: _paths.noSignatureSignedPdf,
    noVisualSignedPdf:    _paths.noVisualSignedPdf,
    noOptionalsSignedPdf: _paths.noOptionalsSignedPdf,

    fieldSignedPdf:            _paths.fieldSignedPdf,
    noSignatureFieldSignedPdf: _paths.noSignatureFieldSignedPdf,
    noVisualFieldSignedPdf:    _paths.noVisualFieldSignedPdf,
    noOptionalsFieldSignedPdf: _paths.noOptionalsFieldSignedPdf,

    visualSignedPdf:             _paths.visualSignedPdf,
    visualSignedReverseYPdf:     _paths.visualSignedReverseYPdf,
    noBackgroundVisualSignedPdf: _paths.noBackgroundVisualSignedPdf,
    noTextsVisualSignedPdf:      _paths.noTextsVisualSignedPdf,
    noOptionalsVisualSignedPdf:  _paths.noOptionalsVisualSignedPdf,

    checkSignedPdf: _paths.checkSignedPdf
  }

  get pdf() {
    return this._pdf.content;
  }

  get reverseYPdf() {
    return this._reverseYPdf.content;
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

  get differentPlaceholderPdf() {
    return this._differentPlaceholderPdf.content;
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
};

export const pdfSignerAssets = new PdfSignerAssets();
