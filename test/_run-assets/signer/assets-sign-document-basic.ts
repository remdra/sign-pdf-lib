import { BinaryAssetFile, JsonAssetFile, TextAssetFile } from '../../_helpers/assets';
import { commonAssets } from '../_assets-common';

import * as path from 'path';

const baseFolder = path.join('test', '_assets', 'signer', 'sign-document-basic'); 

function getPath(file: string) {
  return path.join(baseFolder, file);
}

const _paths = {
  docPdf:                        getPath('doc.pdf'),
  placeholderPdf:                getPath('placeholder.pdf'),
  fieldPdf:                      getPath('field.pdf'),
  registerDictPdf:               getPath('register-dict.pdf'),
  addDictPdf:                    getPath('add-dict.pdf'),
  addPageAnnotPdf:               getPath('add-page-annot.pdf'),
  addFormFieldPdf:               getPath('add-form-field.pdf'),
  addPageContentPdf:             getPath('add-page-content.pdf'),
  addPageResourcePdf:            getPath('add-page-resource.pdf'),
  registerStreamPdf:             getPath('register-stream.pdf'),
  markObjAsChangedPdf:           getPath('mark-obj-as-changed.pdf'),
  savePdf:                       getPath('save.pdf'),
  placeholderIntervals:          getPath('intervals-placeholder.json'),
  signatureIntervals:            getPath('intervals-signature.json'),
  acroFormPdf:                   getPath('acro-form.pdf'),
  pageAnnotsPdf:                 getPath('page-annots.pdf'),
  secondPageAnnotsPdf:           getPath('second-page-annots.pdf'),
  pageContentsArrayPdf:          getPath('page-contents-array.pdf'),
  secondPageContentsArrayPdf:    getPath('second-page-contents-array.pdf'),
  pageResourcesXobjectPdf:       getPath('page-resources-xobject.pdf'),
  secondPageResourcesXobjectPdf: getPath('second-page-resources-xobject.pdf'),
  jpgImagePdf:                   getPath('jpg-signature.pdf'),
  pngImagePdf:                   getPath('png-signature.pdf'),
  signedPdf:                     getPath('signed.pdf'),
  signedTwicePdf:                getPath('signed-twice.pdf'),
  pageFontPdf:                   getPath('page-font.pdf'),
  secondPageFontPdf:             getPath('second-page-font.pdf'),

  placeholderBytes:              getPath('placeholder-bytes.bin'),
  hexStringSignature:            getPath('signature-hex-string.hex'),
  binarySignature:               getPath('signature.bin')
};


class SignDocumentBasicAssets {
  
  private _docPdf                        = new BinaryAssetFile(_paths.docPdf);
  private _placeholderPdf                = new BinaryAssetFile(_paths.placeholderPdf);
  private _fieldPdf                      = new BinaryAssetFile(_paths.fieldPdf);
  private _registerDictPdf               = new BinaryAssetFile(_paths.registerDictPdf);
  private _addDictPdf                    = new BinaryAssetFile(_paths.addDictPdf);
  private _addPageAnnotPdf               = new BinaryAssetFile(_paths.addPageAnnotPdf);
  private _addFormFieldPdf               = new BinaryAssetFile(_paths.addFormFieldPdf);
  private _addPageContentPdf             = new BinaryAssetFile(_paths.addPageContentPdf);
  private _addPageResourcePdf            = new BinaryAssetFile(_paths.addPageResourcePdf);
  private _registerStreamPdf             = new BinaryAssetFile(_paths.registerStreamPdf);
  private _markObjAsChangedPdf           = new BinaryAssetFile(_paths.markObjAsChangedPdf);
  private _savePdf                       = new BinaryAssetFile(_paths.savePdf);
  private _placeholderIntervals          = new JsonAssetFile(_paths.placeholderIntervals);
  private _signatureIntervals            = new JsonAssetFile(_paths.signatureIntervals);
  private _acroFormPdf                   = new BinaryAssetFile(_paths.acroFormPdf);
  private _pageAnnotsPdf                 = new BinaryAssetFile(_paths.pageAnnotsPdf);
  private _secondPageAnnotsPdf           = new BinaryAssetFile(_paths.secondPageAnnotsPdf);
  private _pageContentsArrayPdf          = new BinaryAssetFile(_paths.pageContentsArrayPdf);
  private _secondPageContentsArrayPdf    = new BinaryAssetFile(_paths.secondPageContentsArrayPdf);
  private _pageResourcesXobjectPdf       = new BinaryAssetFile(_paths.pageResourcesXobjectPdf);
  private _secondPageResourcesXobjectPdf = new BinaryAssetFile(_paths.secondPageResourcesXobjectPdf);
  private _jpgImagePdf                   = new BinaryAssetFile(_paths.jpgImagePdf);
  private _pngImagePdf                   = new BinaryAssetFile(_paths.pngImagePdf);
  private _signedPdf                     = new BinaryAssetFile(_paths.signedPdf);
  private _signedTwicePdf                = new BinaryAssetFile(_paths.signedTwicePdf);
  private _pageFontPdf                   = new BinaryAssetFile(_paths.pageFontPdf);
  private _secondPageFontPdf             = new BinaryAssetFile(_paths.secondPageFontPdf);

  private _placeholderBytes              = new BinaryAssetFile(_paths.placeholderBytes);
  private _hexStringSignature            = new TextAssetFile(_paths.hexStringSignature);
  private _binarySignature               = new BinaryAssetFile(_paths.binarySignature);

  public paths = {
    docPdf:                        _paths.docPdf,
    placeholderPdf:                _paths.placeholderPdf,
    fieldPdf:                      _paths.fieldPdf,
    registerDictPdf:               _paths.registerDictPdf,
    addDictPdf:                    _paths.addDictPdf,
    addPageAnnotPdf:               _paths.addPageAnnotPdf,
    addFormFieldPdf:               _paths.addFormFieldPdf,
    addPageContentPdf:             _paths.addPageContentPdf,
    addPageResourcePdf:            _paths.addPageResourcePdf,
    registerStreamPdf:             _paths.registerStreamPdf,
    markObjAsChangedPdf:           _paths.markObjAsChangedPdf,
    savePdf:                       _paths.savePdf,
    placeholderIntervals:          _paths.placeholderIntervals,
    signatureIntervals:            _paths.signatureIntervals,
    acroFormPdf:                   _paths.acroFormPdf,
    pageAnnotsPdf:                 _paths.pageAnnotsPdf,
    secondPageAnnotsPdf:           _paths.secondPageAnnotsPdf,
    pageContentsArrayPdf:          _paths.pageContentsArrayPdf,
    secondPageContentsArrayPdf:    _paths.secondPageContentsArrayPdf,
    pageResourcesXobjectPdf:       _paths.pageResourcesXobjectPdf,
    secondPageResourcesXobjectPdf: _paths.secondPageResourcesXobjectPdf,
    jpgImagePdf:                   _paths.jpgImagePdf,
    pngImagePdf:                   _paths.pngImagePdf,
    signedPdf:                     _paths.signedPdf,
    signedTwicePdf:                _paths.signedTwicePdf,
    pageFontPdf:                   _paths.pageFontPdf,
    secondPageFontPdf:             _paths.secondPageFontPdf,

    placeholderBytes:   _paths.placeholderBytes,
    hexStringSignature: _paths.hexStringSignature,
    binarySignature:    _paths.binarySignature
  }

  get docPdf() {
    return this._docPdf.content;
  }

  get placeholderPdf() {
    return this._placeholderPdf.content;
  }

  get fieldPdf() {
    return this._fieldPdf.content;
  }

  get registerDictPdf() {
    return this._registerDictPdf.content;
  }

  get addDictPdf() {
    return this._addDictPdf.content;
  }

  get addPageAnnotPdf() {
    return this._addPageAnnotPdf.content;
  }

  get addFormFieldPdf() {
    return this._addFormFieldPdf.content;
  }

  get addPageContentPdf() {
    return this._addPageContentPdf.content;
  }

  get addPageResourcePdf() {
    return this._addPageResourcePdf.content;
  }

  get registerStreamPdf() {
    return this._registerStreamPdf.content;
  }

  get markObjAsChangedPdf() {
    return this._markObjAsChangedPdf.content;
  }

  get savePdf() {
    return this._savePdf.content;
  }

  get placeholderIntervals() {
    return this._placeholderIntervals.content;
  }

  get signatureIntervals() {
    return this._signatureIntervals.content;
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

  get jpgImagePdf() {
    return this._jpgImagePdf.content;
  }

  get pngImagePdf() {
    return this._pngImagePdf.content;
  }

  get signedPdf() {
    return this._signedPdf.content;
  }

  get signedTwicePdf() {
    return this._signedTwicePdf.content;
  }

  get pageFontPdf() {
    return this._pageFontPdf.content;
  }

  get secondPageFontPdf() {
    return this._secondPageFontPdf.content;
  }

  get jpgImage() {
    return commonAssets.jpgImage;
  }

  get pngImage() {
    return commonAssets.pngImage;
  }

  get badImage() {
    return commonAssets.badImage;
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

export const signDocumentBasicAssets = new SignDocumentBasicAssets();
