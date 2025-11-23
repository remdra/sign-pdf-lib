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
  placeholderPdf:                getPath('placeholder.pdf'),
};


class SignDocumentAssets {
  
  private _docPdf                        = new BinaryAssetFile(_paths.docPdf);
  private _fieldPdf                      = new BinaryAssetFile(_paths.fieldPdf);
  private _pageTwoFieldPdf               = new BinaryAssetFile(_paths.pageTwoFieldPdf);
  private _placeholderPdf                = new BinaryAssetFile(_paths.placeholderPdf);

  public paths = {
    docPdf:                        _paths.docPdf,
    fieldPdf:                      _paths.fieldPdf,
    pageTwoFieldPdf:               _paths.pageTwoFieldPdf,
    placeholderPdf:                _paths.placeholderPdf,
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

  get placeholderPdf() {
    return this._placeholderPdf.content;
  }

  get signatureBackground() {
    return commonAssets.pngImage;
  }
};

export const signDocumentAssets = new SignDocumentAssets();
