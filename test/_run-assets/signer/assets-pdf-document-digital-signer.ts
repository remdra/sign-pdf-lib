import { BinaryAssetFile, JsonAssetFile } from '../../_helpers/assets';
import { commonAssets } from '../_assets-common';

import * as path from 'path';

const baseFolder = path.join('test', '_assets', 'signer', 'pdf-document-digital-signer'); 

function getPath(file: string) {
  return path.join(baseFolder, file);
}

function getFieldPath(file: string) {
  return path.join(baseFolder, 'field', file);
}

function getVisualPath(file: string) {
  return path.join(baseFolder, 'visual', file);
}

function getPlaceholderPath(file: string) {
  return path.join(baseFolder, 'placeholder', file);
}

function getUpdatePath(file: string) {
  return path.join(baseFolder, 'update', file);
}

function getSavePath(file: string) {
  return path.join(baseFolder, 'save', file);
}

const _paths = {
  pdf:                getPath('pdf.pdf'),
  realFieldPdf:       getPath('field.pdf'),
  realPlaceholderPdf: getPath('placeholder.pdf'),

  fieldPdf:                 getFieldPath('field.pdf'),
  noNameFieldPdf:           getFieldPath('field-no-name.pdf'),
  noRectangleFieldPdf:      getFieldPath('field-no-rectangle.pdf'),
  noVisualRefFieldPdf:      getFieldPath('field-no-visual-ref.pdf'),
  noPlaceholderRefFieldPdf: getFieldPath('field-no-placeholder-ref.pdf'),
  noFontFieldPdf:           getFieldPath('field-no-font.pdf'),
  noOptionalsFieldPdf:      getFieldPath('field-no-optionals.pdf'),
  pageTwoFieldPdf:          getFieldPath('field-page-two.pdf'),

  visualPdf:             getVisualPath('visual.pdf'),
  noBackgroundVisualPdf: getVisualPath('visual-no-background.pdf'),
  noTextsVisualPdf:      getVisualPath('visual-no-texts.pdf'),
  noOptionalsVisualPdf:  getVisualPath('visual-no-optional.pdf'),
  emptyVisualPdf:        getVisualPath('visual-empty.pdf'),

  placeholderPdf:                  getPlaceholderPath('palceholder.pdf'),
  noNamePlaceholderPdf:            getPlaceholderPath('palceholder-no-name.pdf'),
  noReasonPlaceholderPdf:          getPlaceholderPath('palceholder-no-reason.pdf'),
  noLocationPlaceholderPdf:        getPlaceholderPath('palceholder-no-location.pdf'),
  noContactInfoPlaceholderPdf:     getPlaceholderPath('palceholder-no-contact-info.pdf'),
  noDatePlaceholderPdf:            getPlaceholderPath('palceholder-no-date.pdf'),
  noOptionalsPlaceholderPdf:       getPlaceholderPath('palceholder-no-optionals.pdf'),
  differentSettingsPlaceholderPdf: getPlaceholderPath('palceholder-different-settings.pdf'),

  updatePdf:             getUpdatePath('update.pdf'),
  noVisualRefUpdatePdf:  getUpdatePath('update-no-visual-ref.pdf'),
  noFontUpdatePdf:       getUpdatePath('update-no-font.pdf'),
  noOptionalsUpdatedPdf: getUpdatePath('update-no-optionals.pdf'),

  savePdf: getSavePath('save.pdf'),

  ranges: getPath('ranges.json')
};

class PdfDocumentDigitalSignerAssets {
  
  private _pdf                = new BinaryAssetFile(_paths.pdf);
  private _realFieldPdf       = new BinaryAssetFile(_paths.realFieldPdf);
  private _realPlaceholderPdf = new BinaryAssetFile(_paths.realPlaceholderPdf);

  private _fieldPdf                 = new BinaryAssetFile(_paths.fieldPdf);
  private _noNameFieldPdf           = new BinaryAssetFile(_paths.noNameFieldPdf);
  private _noRectangleFieldPdf      = new BinaryAssetFile(_paths.noRectangleFieldPdf);
  private _noVisualRefFieldPdf      = new BinaryAssetFile(_paths.noVisualRefFieldPdf);
  private _noPlaceholderRefFieldPdf = new BinaryAssetFile(_paths.noPlaceholderRefFieldPdf);
  private _noFontFieldPdf           = new BinaryAssetFile(_paths.noFontFieldPdf);
  private _noOptionalsFieldPdf      = new BinaryAssetFile(_paths.noOptionalsFieldPdf);
  private _pageTwoFieldPdf          = new BinaryAssetFile(_paths.pageTwoFieldPdf);

  private _visualPdf             = new BinaryAssetFile(_paths.visualPdf);
  private _noBackgroundVisualPdf = new BinaryAssetFile(_paths.noBackgroundVisualPdf);
  private _noTextsVisualPdf      = new BinaryAssetFile(_paths.noTextsVisualPdf);
  private _noOptionalsVisualPdf  = new BinaryAssetFile(_paths.noOptionalsVisualPdf);
  private _emptyVisualPdf        = new BinaryAssetFile(_paths.emptyVisualPdf);

  private _placeholderPdf                  = new BinaryAssetFile(_paths.placeholderPdf);
  private _noNamePlaceholderPdf            = new BinaryAssetFile(_paths.noNamePlaceholderPdf);
  private _noReasonPlaceholderPdf          = new BinaryAssetFile(_paths.noReasonPlaceholderPdf);
  private _noLocationPlaceholderPdf        = new BinaryAssetFile(_paths.noLocationPlaceholderPdf);
  private _noContactInfoPlaceholderPdf     = new BinaryAssetFile(_paths.noContactInfoPlaceholderPdf);
  private _noDatePlaceholderPdf            = new BinaryAssetFile(_paths.noDatePlaceholderPdf);
  private _noOptionalsPlaceholderPdf       = new BinaryAssetFile(_paths.noOptionalsPlaceholderPdf);
  private _differentSettingsPlaceholderPdf = new BinaryAssetFile(_paths.differentSettingsPlaceholderPdf);

  private _updatePdf             = new BinaryAssetFile(_paths.updatePdf);
  private _noVisualRefUpdatePdf  = new BinaryAssetFile(_paths.noVisualRefUpdatePdf);
  private _noFontUpdatePdf       = new BinaryAssetFile(_paths.noFontUpdatePdf);
  private _noOptionalsUpdatedPdf = new BinaryAssetFile(_paths.noOptionalsUpdatedPdf);

  private _savePdf = new BinaryAssetFile(_paths.savePdf);

  private _ranges = new JsonAssetFile(_paths.ranges);

  public paths = {
    pdf:                _paths.pdf,
    realFieldPdf:       _paths.realFieldPdf,
    realPlaceholderPdf: _paths.realPlaceholderPdf,
 
    fieldPdf:                 _paths.fieldPdf,
    noNameFieldPdf:           _paths.noNameFieldPdf,
    noRectangleFieldPdf:      _paths.noRectangleFieldPdf,
    noVisualRefFieldPdf:      _paths.noVisualRefFieldPdf,
    noPlaceholderRefFieldPdf: _paths.noPlaceholderRefFieldPdf,
    noFontFieldPdf:           _paths.noFontFieldPdf,
    noOptionalsFieldPdf:      _paths.noOptionalsFieldPdf,
    pageTwoFieldPdf:          _paths.pageTwoFieldPdf,

    visualPdf:             _paths.visualPdf,
    noBackgroundVisualPdf: _paths.noBackgroundVisualPdf,
    noTextsVisualPdf:      _paths.noTextsVisualPdf,
    noOptionalsVisualPdf:  _paths.noOptionalsVisualPdf,
    emptyVisualPdf:        _paths.emptyVisualPdf,

    placeholderPdf:                  _paths.placeholderPdf,
    noNamePlaceholderPdf:            _paths.noNamePlaceholderPdf,
    noReasonPlaceholderPdf:          _paths.noReasonPlaceholderPdf,
    noLocationPlaceholderPdf:        _paths.noLocationPlaceholderPdf,
    noContactInfoPlaceholderPdf:     _paths.noContactInfoPlaceholderPdf,
    noDatePlaceholderPdf:            _paths.noDatePlaceholderPdf,
    noOptionalsPlaceholderPdf:       _paths.noOptionalsPlaceholderPdf,
    differentSettingsPlaceholderPdf: _paths.differentSettingsPlaceholderPdf,

    updatePdf:             _paths.updatePdf,
    noVisualRefUpdatePdf:  _paths.noVisualRefUpdatePdf,
    noFontUpdatePdf:       _paths.noFontUpdatePdf,
    noOptionalsUpdatedPdf: _paths.noOptionalsUpdatedPdf,

    savePdf: _paths.savePdf,

    ranges: _paths.ranges
  }

  get pdf() {
    return this._pdf.content;
  }

  get realFieldPdf() {
    return this._realFieldPdf.content;
  }

  get realPlaceholderPdf() {
    return this._realPlaceholderPdf.content;
  }

  get visual() {
    return commonAssets.pngImage;
  }

  get fieldPdf() {
    return this._fieldPdf.content;
  }

  get noNameFieldPdf() {
    return this._noNameFieldPdf.content;
  }

  get noRectangleFieldPdf() {
    return this._noRectangleFieldPdf.content;
  }

  get noVisualRefFieldPdf() {
    return this._noVisualRefFieldPdf.content;
  }

  get noPlaceholderRefFieldPdf() {
    return this._noPlaceholderRefFieldPdf.content;
  }

  get noFontFieldPdf() {
    return this._noFontFieldPdf.content;
  }

  get noOptionalsFieldPdf() {
    return this._noOptionalsFieldPdf.content;
  }

  get pageTwoFieldPdf() {
    return this._pageTwoFieldPdf.content;
  }

  get visualPdf() {
    return this._visualPdf.content;
  }

  get noBackgroundVisualPdf() {
    return this._noBackgroundVisualPdf.content;
  }

  get noTextsVisualPdf() {
    return this._noTextsVisualPdf.content;
  }

  get noOptionalsVisualPdf() {
    return this._noOptionalsVisualPdf.content;
  }

  get emptyVisualPdf() {
    return this._emptyVisualPdf.content;
  }

  get placeholderPdf() {
    return this._placeholderPdf.content;
  }

  get noNamePlaceholderPdf() {
    return this._noNamePlaceholderPdf.content;
  }

  get noReasonPlaceholderPdf() {
    return this._noReasonPlaceholderPdf.content;
  }

  get noLocationPlaceholderPdf() {
    return this._noLocationPlaceholderPdf.content;
  }

  get noContactInfoPlaceholderPdf() {
    return this._noContactInfoPlaceholderPdf.content;
  }

  get noDatePlaceholderPdf() {
    return this._noDatePlaceholderPdf.content;
  }

  get noOptionalsPlaceholderPdf() {
    return this._noOptionalsPlaceholderPdf.content;
  }

  get differentSettingsPlaceholderPdf() {
    return this._differentSettingsPlaceholderPdf.content;
  }

  get updatePdf() {
    return this._updatePdf.content;
  }

  get noVisualRefUpdatePdf() {
    return this._noVisualRefUpdatePdf.content;
  }

  get noFontUpdatePdf() {
    return this._noFontUpdatePdf.content;
  }

  get noOptionalsUpdatedPdf() {
    return this._noOptionalsUpdatedPdf.content;
  }

  get savePdf() {
    return this._savePdf.content;
  }

  get ranges() {
    return this._ranges.content;
  }
};

export const pdfDocumentDigitalSignerAssets = new PdfDocumentDigitalSignerAssets();
