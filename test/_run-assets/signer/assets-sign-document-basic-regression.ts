import { BinaryAssetFile } from '../../_helpers/assets';

import * as path from 'path';

const baseFolder = path.join('test', '_assets', 'regression', 'sign-document-basic'); 

function getPath(file: string) {
  return path.join(baseFolder, file);
}

const _paths = {
  blankPdf:                      getPath('blank.pdf'),
  acroFormPdf:                   getPath('acro-form.pdf'),
  pageAnnotsPdf:                 getPath('page-annots.pdf'),
  secondPageAnnotsPdf:           getPath('second-page-annots.pdf'),
  pageContentsArrayPdf:          getPath('page-contents-array.pdf'),
  secondPageContentsArrayPdf:    getPath('second-page-contents-array.pdf'),
  pageResourcesXobjectPdf:       getPath('page-resources-xobject.pdf'),
  secondPageResourcesXobjectPdf: getPath('second-page-resources-xobject.pdf'),
  pageFontPdf:                   getPath('page-font.pdf'),
  secondPageFontPdf:             getPath('second-page-font.pdf'),
};


class SignDocumentBasicRegressionAssets {
  
  private _blankPdf                      = new BinaryAssetFile(_paths.blankPdf);
  private _acroFormPdf                   = new BinaryAssetFile(_paths.acroFormPdf);
  private _pageAnnotsPdf                 = new BinaryAssetFile(_paths.pageAnnotsPdf);
  private _secondPageAnnotsPdf           = new BinaryAssetFile(_paths.secondPageAnnotsPdf);
  private _pageContentsArrayPdf          = new BinaryAssetFile(_paths.pageContentsArrayPdf);
  private _secondPageContentsArrayPdf    = new BinaryAssetFile(_paths.secondPageContentsArrayPdf);
  private _pageResourcesXobjectPdf       = new BinaryAssetFile(_paths.pageResourcesXobjectPdf);
  private _secondPageResourcesXobjectPdf = new BinaryAssetFile(_paths.secondPageResourcesXobjectPdf);
  private _pageFontPdf                   = new BinaryAssetFile(_paths.pageFontPdf);
  private _secondPageFontPdf             = new BinaryAssetFile(_paths.secondPageFontPdf);

  public paths = {
    blankPdf:                      _paths.blankPdf,
    acroFormPdf:                   _paths.acroFormPdf,
    pageAnnotsPdf:                 _paths.pageAnnotsPdf,
    secondPageAnnotsPdf:           _paths.secondPageAnnotsPdf,
    pageContentsArrayPdf:          _paths.pageContentsArrayPdf,
    secondPageContentsArrayPdf:    _paths.secondPageContentsArrayPdf,
    pageResourcesXobjectPdf:       _paths.pageResourcesXobjectPdf,
    secondPageResourcesXobjectPdf: _paths.secondPageResourcesXobjectPdf,
    pageFontPdf:                   _paths.pageFontPdf,
    secondPageFontPdf:             _paths.secondPageFontPdf,
}

  get blankPdf() {
    return this._blankPdf.content;
  }

  get acroFormPdf() {
    return this._acroFormPdf.content;
  }

  get pageAnnotsPdf() {
    return this._pageAnnotsPdf.content;
  }

  get secondPageAnnotsPdf() {
    return this._secondPageAnnotsPdf.content;
  }

  get pageContentsArrayPdf() {
    return this._pageContentsArrayPdf.content;
  }

  get secondPageContentsArrayPdf() {
    return this._secondPageContentsArrayPdf.content;
  }

  get pageResourcesXobjectPdf() {
    return this._pageResourcesXobjectPdf.content;
  }

  get secondPageResourcesXobjectPdf() {
    return this._secondPageResourcesXobjectPdf.content;
  }

  get pageFontPdf() {
    return this._pageFontPdf.content;
  }

  get secondPageFontPdf() {
    return this._secondPageFontPdf.content;
  }
};

export const signDocumentBasicRegressionAssets = new SignDocumentBasicRegressionAssets();
