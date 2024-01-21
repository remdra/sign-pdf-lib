import { BinaryAssetFile } from '../../_helpers/assets';
import { commonAssets } from '../_assets-common';

import * as path from 'path';

const baseFolder = path.join('test', '_assets', 'signer', 'pdf-document-visual-signer'); 

function getPath(file: string) {
  return path.join(baseFolder, file);
}

const _paths = {
  pdf:                   getPath('pdf.pdf'),
  fieldPdf:              getPath('field.pdf'),
  placeholderPdf:        getPath('placeholder.pdf'),
  visualPdf:             getPath('visual.pdf'),
  noBackgroundVisualPdf: getPath('visual-no-background.pdf'),
  noTextsVisualPdf:      getPath('visual-no-texts.pdf'),
  noOptionalsVisualPdf:  getPath('visual-no-optional.pdf'),
  savePdf:               getPath('save.pdf')
};

class PdfDocumentVisualSignerAssets {
  
  private _pdf                   = new BinaryAssetFile(_paths.pdf);
  private _fieldPdf              = new BinaryAssetFile(_paths.fieldPdf);
  private _placeholderPdf        = new BinaryAssetFile(_paths.placeholderPdf);
  private _visualPdf             = new BinaryAssetFile(_paths.visualPdf);
  private _noBackgroundVisualPdf = new BinaryAssetFile(_paths.noBackgroundVisualPdf);
  private _noTextsVisualPdf      = new BinaryAssetFile(_paths.noTextsVisualPdf);
  private _noOptionalsVisualPdf  = new BinaryAssetFile(_paths.noOptionalsVisualPdf);
  private _savePdf               = new BinaryAssetFile(_paths.savePdf);

  public paths = {
    pdf:                   _paths.pdf,
    fieldPdf:              _paths.fieldPdf,
    placeholderPdf:        _paths.placeholderPdf,
    visualPdf:             _paths.visualPdf,
    noBackgroundVisualPdf: _paths.noBackgroundVisualPdf,
    noTextsVisualPdf:      _paths.noTextsVisualPdf,
    noOptionalsVisualPdf:  _paths.noOptionalsVisualPdf,
    savePdf:               _paths.savePdf
  }

  get pdf() {
    return this._pdf.content;
  }

  get fieldPdf() {
    return this._fieldPdf.content;
  }

  get placeholderPdf() {
    return this._placeholderPdf.content;
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

  get savePdf() {
    return this._savePdf.content;
  }

  get visual() {
    return commonAssets.pngImage;
  }
};

export const pdfDocumentVisualSignerAssets = new PdfDocumentVisualSignerAssets();
