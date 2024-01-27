import { BinaryAssetFile, JsonAssetFile, TextAssetFile } from '../../_helpers/assets';
import { commonAssets } from '../_assets-common';

import * as path from 'path';

const baseFolder = path.join('test', '_assets', 'signer', 'pdf-signing-document'); 

function getPath(file: string) {
  return path.join(baseFolder, file);
}

const _paths = {
  pdf:                           getPath('pdf.pdf'),
  placeholderPdf:                getPath('pdf-placeholder.pdf'),
  fieldPdf:                      getPath('pdf-field.pdf'),
  registerDictPdf:               getPath('pdf-register-dict.pdf'),
  addDictPdf:                    getPath('pdf-add-dict.pdf'),
  addPageAnnotPdf:               getPath('pdf-add-page-annot.pdf'),
  addFormFieldPdf:               getPath('pdf-add-form-field.pdf'),
  addPageContentPdf:             getPath('pdf-add-page-content.pdf'),
  addPageResourcePdf:            getPath('pdf-add-page-resource.pdf'),
  registerStreamPdf:             getPath('pdf-register-stream.pdf'),
  markObjAsChangedPdf:           getPath('pdf-mark-obj-as-changed.pdf'),
  savePdf:                       getPath('pdf-save.pdf'),
  placeholderRanges:             getPath('ranges-placeholder.json'),
  signatureRanges:               getPath('ranges-signature.json'),
  acroFormPdf:                   getPath('pdf-acro-form.pdf'),
  pageAnnotsPdf:                 getPath('pdf-page-annots.pdf'),
  secondPageAnnotsPdf:           getPath('pdf-second-page-annots.pdf'),
  pageContentsArrayPdf:          getPath('pdf-page-contents-array.pdf'),
  secondPageContentsArrayPdf:    getPath('pdf-second-page-contents-array.pdf'),
  pageResourcesXobjectPdf:       getPath('pdf-page-resources-xobject.pdf'),
  secondPageResourcesXobjectPdf: getPath('pdf-second-page-resources-xobject.pdf'),
  jpgImagePdf:                   getPath('pdf-jpg-signature.pdf'),
  pngImagePdf:                   getPath('pdf-png-signature.pdf'),
  signedTwicePdf:                getPath('pdf-signed-twice.pdf'),
  pageEmbededFontPdf:            getPath('pdf-page-font.pdf'),
  secondPageEmbededFontPdf:      getPath('pdf-second-page-font.pdf'),

  signatureBuffer:               getPath('signature-buffer.bin'),
  signatureHexString:            getPath('signature-hex-string.hex')
};


class PdfSigningDocumentAssets {
  
  private _pdf                           = new BinaryAssetFile(_paths.pdf);
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
  private _placeholderRanges             = new JsonAssetFile(_paths.placeholderRanges);
  private _signatureRanges               = new JsonAssetFile(_paths.signatureRanges);
  private _acroFormPdf                   = new BinaryAssetFile(_paths.acroFormPdf);
  private _pageAnnotsPdf                 = new BinaryAssetFile(_paths.pageAnnotsPdf);
  private _secondPageAnnotsPdf           = new BinaryAssetFile(_paths.secondPageAnnotsPdf);
  private _pageContentsArrayPdf          = new BinaryAssetFile(_paths.pageContentsArrayPdf);
  private _secondPageContentsArrayPdf    = new BinaryAssetFile(_paths.secondPageContentsArrayPdf);
  private _pageResourcesXobjectPdf       = new BinaryAssetFile(_paths.pageResourcesXobjectPdf);
  private _secondPageResourcesXobjectPdf = new BinaryAssetFile(_paths.secondPageResourcesXobjectPdf);
  private _jpgImagePdf                   = new BinaryAssetFile(_paths.jpgImagePdf);
  private _pngImagePdf                   = new BinaryAssetFile(_paths.pngImagePdf);
  private _signedTwicePdf                = new BinaryAssetFile(_paths.signedTwicePdf);
  private _pageEmbededFontPdf            = new BinaryAssetFile(_paths.pageEmbededFontPdf);
  private _secondPageEmbededFontPdf      = new BinaryAssetFile(_paths.secondPageEmbededFontPdf);

  private _signatureBuffer               = new BinaryAssetFile(_paths.signatureBuffer);
  private _signatureHexString            = new TextAssetFile(_paths.signatureHexString);

  public paths = {
    pdf:                           _paths.pdf,
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
    placeholderRanges:             _paths.placeholderRanges,
    signatureRanges:               _paths.signatureRanges,
    acroFormPdf:                   _paths.acroFormPdf,
    pageAnnotsPdf:                 _paths.pageAnnotsPdf,
    secondPageAnnotsPdf:           _paths.secondPageAnnotsPdf,
    pageContentsArrayPdf:          _paths.pageContentsArrayPdf,
    secondPageContentsArrayPdf:    _paths.secondPageContentsArrayPdf,
    pageResourcesXobjectPdf:       _paths.pageResourcesXobjectPdf,
    secondPageResourcesXobjectPdf: _paths.secondPageResourcesXobjectPdf,
    jpgImagePdf:                   _paths.jpgImagePdf,
    pngImagePdf:                   _paths.pngImagePdf,
    signedTwicePdf:                _paths.signedTwicePdf,
    pageEmbededFontPdf:            _paths.pageEmbededFontPdf,
    secondPageEmbededFontPdf:      _paths.secondPageEmbededFontPdf,

    signatureBuffer:    _paths.signatureBuffer,
    signatureHexString: _paths.signatureHexString
  }

  get pdf() {
    return this._pdf.content;
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

  get placeholderRanges() {
    return this._placeholderRanges.content;
  }

  get signatureRanges() {
    return this._signatureRanges.content;
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

  get signedTwicePdf() {
    return this._signedTwicePdf.content;
  }

  get pageEmbededFontPdf() {
    return this._pageEmbededFontPdf.content;
  }

  get secondPageEmbededFontPdf() {
    return this._secondPageEmbededFontPdf.content;
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

  get signatureBuffer() {
    return this._signatureBuffer.content;
  }

  get signatureHexString() {
    return this._signatureHexString.content;
  }
};

export const signingDocumentAssets = new PdfSigningDocumentAssets();
