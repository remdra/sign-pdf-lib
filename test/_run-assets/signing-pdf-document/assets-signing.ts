import { BinaryAssetFile } from '../../_helpers/assets/binary-asset-file';
import * as path from 'path';

const baseFolder = path.join('test', '_assets', 'signing-pdf-document'); 

const _paths = {
  pdf:                      path.join(baseFolder, 'pdf.pdf'),
  fieldPdf:                 path.join(baseFolder, 'field.pdf'),
  noNameFieldPdf:           path.join(baseFolder, 'field-no-name.pdf'),
  noRectangleFieldPdf:      path.join(baseFolder, 'field-no-rectangle.pdf'),
  noVisualRefFieldPdf:      path.join(baseFolder, 'field-no-visual-ref.pdf'),
  noPlaceholderRefFieldPdf: path.join(baseFolder, 'field-no-placeholder-ref.pdf'),
  noFontFieldPdf:           path.join(baseFolder, 'field-no-font.pdf'),
  noOptionalsFieldPdf:      path.join(baseFolder, 'field-no-optionals.pdf'),
  pageTwoFieldPdf:          path.join(baseFolder, 'field-page-two.pdf'),
};


class SigningAssets {
  
  private _pdf                      = new BinaryAssetFile(_paths.pdf);
  private _fieldPdf                 = new BinaryAssetFile(_paths.fieldPdf);
  private _noNameFieldPdf           = new BinaryAssetFile(_paths.noNameFieldPdf);
  private _noRectangleFieldPdf      = new BinaryAssetFile(_paths.noRectangleFieldPdf);
  private _noVisualRefFieldPdf      = new BinaryAssetFile(_paths.noVisualRefFieldPdf);
  private _noPlaceholderRefFieldPdf = new BinaryAssetFile(_paths.noPlaceholderRefFieldPdf);
  private _noFontFieldPdf           = new BinaryAssetFile(_paths.noFontFieldPdf);
  private _noOptionalsFieldPdf      = new BinaryAssetFile(_paths.noOptionalsFieldPdf);
  private _pageTwoFieldPdf          = new BinaryAssetFile(_paths.pageTwoFieldPdf);

  public paths = {
    pdf:                      _paths.pdf,
    fieldPdf:                 _paths.fieldPdf,
    noNameFieldPdf:           _paths.noNameFieldPdf,
    noRectangleFieldPdf:      _paths.noRectangleFieldPdf,
    noVisualRefFieldPdf:      _paths.noVisualRefFieldPdf,
    noPlaceholderRefFieldPdf: _paths.noPlaceholderRefFieldPdf,
    noFontFieldPdf:           _paths.noFontFieldPdf,
    noOptionalsFieldPdf:      _paths.noOptionalsFieldPdf,
    pageTwoFieldPdf:          _paths.pageTwoFieldPdf
  }

  get pdf() {
    return this._pdf.content;
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
};

export const signingAssets = new SigningAssets();
