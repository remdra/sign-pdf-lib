import { BinaryAssetFile, JsonAssetFile, TextAssetFile } from '../../_helpers/assets';

import * as path from 'path';

const baseFolder = path.join('test', '_assets', 'signer', 'sign-document'); 

function getPath(file: string) {
  return path.join(baseFolder, file);
}

const _paths = {
  docPdf:                        getPath('doc.pdf'),
  fieldPdf:                      getPath('field.pdf'),
  pageTwoFieldPdf:               getPath('page-two-field.pdf'),
};


class SignDocumentAssets {
  
  private _docPdf                        = new BinaryAssetFile(_paths.docPdf);
  private _fieldPdf                      = new BinaryAssetFile(_paths.fieldPdf);
  private _pageTwoFieldPdf               = new BinaryAssetFile(_paths.pageTwoFieldPdf);

  public paths = {
    docPdf:                        _paths.docPdf,
    fieldPdf:                      _paths.fieldPdf,
    pageTwoFieldPdf:               _paths.pageTwoFieldPdf,
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
};

export const signDocumentAssets = new SignDocumentAssets();
