import { BinaryAssetFile } from '../../_helpers/assets/binary-asset-file';
import { JsonAssetFile } from '../../_helpers/assets/json-asset-file';
import * as path from 'path';
import { PdfCheckResult, SignatureCheckResult, SignatureDetails } from 'src/models/check-result';

const _paths = {
  pdf:            path.join('test', '_assets', 'pdf-signer', 'pdf-13', 'document.pdf'),

  placeholderPdf: path.join('test', '_assets', 'pdf-signer', 'pdf-13', 'placeholder.pdf'),
  positiveCoordinatesPlaceholderPdf: path.join('test', '_assets', 'pdf-signer', 'pdf-13', 'placeholder-positive-coordinates.pdf'),
  negativeCoordinatesPlaceholderPdf: path.join('test', '_assets', 'pdf-signer', 'pdf-13', 'placeholder-negative-coordinates.pdf'),
  differentPlaceholderPdf: path.join('test', '_assets', 'pdf-signer', 'pdf-13', 'placeholder-different.pdf'),
  noInfoPlaceholderPdf: path.join('test', '_assets', 'pdf-signer', 'pdf-13', 'placeholder-no-info.pdf'),
  jpgImagePlaceholderPdf: path.join('test', '_assets', 'pdf-signer', 'pdf-13', 'placeholder-jpg-image.pdf'),
  pngImagePlaceholderPdf: path.join('test', '_assets', 'pdf-signer', 'pdf-13', 'placeholder-png-image.pdf'),

  signatureJpgImage: path.join('test', '_assets', 'pdf-signer', 'signature.jpg'),
  signaturePngImage: path.join('test', '_assets', 'pdf-signer', 'signature.png'),

  signedPdf:      path.join('test', '_assets', 'pdf-signer', 'pdf-13', 'signed.pdf'),
  positiveCoordinatesSignedPdf:      path.join('test', '_assets', 'pdf-signer', 'pdf-13', 'signed-positive-coordinates.pdf'),
  negativeCoordinatesSignedPdf:      path.join('test', '_assets', 'pdf-signer', 'pdf-13', 'signed-negative-coordinates.pdf'),
  twiceSignedPdf: path.join('test', '_assets', 'pdf-signer', 'pdf-13', 'signed-twice.pdf'),
  jpgImageTwiceSignedPdf: path.join('test', '_assets', 'pdf-signer', 'pdf-13', 'signed-twice-jpg-image.pdf'),
  pngImageTwiceSignedPdf: path.join('test', '_assets', 'pdf-signer', 'pdf-13', 'signed-twice-png-image.pdf'),

  tamperedSignedPdf:      path.join('test', '_assets', 'pdf-signer', 'pdf-13', 'tampered-signed.pdf'),
  tamperedOnlyFirstTwiceSignedPdf: path.join('test', '_assets', 'pdf-signer', 'pdf-13', 'tampered-signed-twice-only-first-tampered.pdf'),
  tamperedAppendedSignedPdf:      path.join('test', '_assets', 'pdf-signer', 'pdf-13', 'tampered-signed-appended.pdf'),

  checkSignedPdf:      path.join('test', '_assets', 'pdf-signer', 'pdf-13', 'signed.check.json'),
  checkTwiceSignedPdf: path.join('test', '_assets', 'pdf-signer', 'pdf-13', 'signed-twice.check.json'),
  
  checkTamperedSignedPdf:      path.join('test', '_assets', 'pdf-signer', 'pdf-13', 'tampered-signed.check.json'),
  checkTamperedOnlyFirstTwiceSignedPdf:      path.join('test', '_assets', 'pdf-signer', 'pdf-13', 'tampered-signed-twice-only-first-tampered.check.json'),
  checkTamperedAppendedSignedPdf:      path.join('test', '_assets', 'pdf-signer', 'pdf-13', 'tampered-signed-appended.check.json'),
};


class PdfSignerAssets13 {
  
  private _pdf = new BinaryAssetFile(_paths.pdf);

  private _placeholderPdf = new BinaryAssetFile(_paths.placeholderPdf);
  private _positiveCoordinatesPlaceholderPdf = new BinaryAssetFile(_paths.positiveCoordinatesPlaceholderPdf);
  private _negativeCoordinatesPlaceholderPdf = new BinaryAssetFile(_paths.negativeCoordinatesPlaceholderPdf);
  private _differentPlaceholderPdf = new BinaryAssetFile(_paths.differentPlaceholderPdf);
  private _noInfoPlaceholderPdf = new BinaryAssetFile(_paths.noInfoPlaceholderPdf);
  private _jpgImagePlaceholderPdf = new BinaryAssetFile(_paths.jpgImagePlaceholderPdf);
  private _pngImagePlaceholderPdf = new BinaryAssetFile(_paths.pngImagePlaceholderPdf);

  private _signatureJpgImage = new BinaryAssetFile(_paths.signatureJpgImage);
  private _signaturePngImage = new BinaryAssetFile(_paths.signaturePngImage);

  private _signedPdf = new BinaryAssetFile(_paths.signedPdf);
  private _positiveCoordinatesSignedPdf = new BinaryAssetFile(_paths.positiveCoordinatesSignedPdf);
  private _negativeCoordinatesSignedPdf = new BinaryAssetFile(_paths.negativeCoordinatesSignedPdf);
  private _twiceSignedPdf = new BinaryAssetFile(_paths.twiceSignedPdf);
  private _jpgImageTwiceSignedPdf = new BinaryAssetFile(_paths.jpgImageTwiceSignedPdf);
  private _pngImageTwiceSignedPdf = new BinaryAssetFile(_paths.pngImageTwiceSignedPdf);

  private _tamperedSignedPdf = new BinaryAssetFile(_paths.tamperedSignedPdf);
  private _tamperedOnlyFirstTwiceSignedPdf = new BinaryAssetFile(_paths.tamperedOnlyFirstTwiceSignedPdf);
  private _tamperedAppendedSignedPdf = new BinaryAssetFile(_paths.tamperedAppendedSignedPdf);

  private _checkSignedPdf = new JsonAssetFile(_paths.checkSignedPdf);
  private _checkTwiceSignedPdf = new JsonAssetFile(_paths.checkTwiceSignedPdf);

  private _checkTamperedSignedPdf = new JsonAssetFile(_paths.checkTamperedSignedPdf);
  private _checkTamperedOnlyFirstTwiceSignedPdf = new JsonAssetFile(_paths.checkTamperedOnlyFirstTwiceSignedPdf);
  private _checkTamperedAppendedSignedPdf = new JsonAssetFile(_paths.checkTamperedAppendedSignedPdf);

  public paths = {
    pdf: _paths.pdf,
    placeholderPdf: _paths.placeholderPdf,
    positiveCoordinatesPlaceholderPdf: _paths.positiveCoordinatesPlaceholderPdf,
    negativeCoordinatesPlaceholderPdf: _paths.negativeCoordinatesPlaceholderPdf,
    differentPlaceholderPdf: _paths.differentPlaceholderPdf,
    noInfoPlaceholderPdf: _paths.noInfoPlaceholderPdf,
    jpgImagePlaceholderPdf: _paths.jpgImagePlaceholderPdf,
    pngImagePlaceholderPdf: _paths.pngImagePlaceholderPdf,

    signedPdf: _paths.signedPdf,
    positiveCoordinatesSignedPdf: _paths.positiveCoordinatesSignedPdf,
    negativeCoordinatesSignedPdf: _paths.negativeCoordinatesSignedPdf,
    twiceSignedPdf: _paths.twiceSignedPdf,
    jpgImageTwiceSignedPdf: _paths.jpgImageTwiceSignedPdf,
    pngImageTwiceSignedPdf: _paths.pngImageTwiceSignedPdf,

    tamperedSignedPdf: _paths.tamperedSignedPdf,
    tamperedOnlyFirstTwiceSignedPdf: _paths.tamperedOnlyFirstTwiceSignedPdf,
    tamperedAppendedSignedPdf: _paths.tamperedAppendedSignedPdf,

    checkSignedPdf: _paths.checkSignedPdf,
    checkTwiceSignedPdf: _paths.checkTwiceSignedPdf,

    checkTamperedSignedPdf: _paths.checkTamperedSignedPdf,
    checkTamperedOnlyFirstTwiceSignedPdf: _paths.checkTamperedOnlyFirstTwiceSignedPdf,
    checkTamperedAppendedSignedPdf: _paths.checkTamperedAppendedSignedPdf
  }

  get pdf() {
    return this._pdf.content;
  }

  get placeholderPdf() {
    return this._placeholderPdf.content;
  }

  get positiveCoordinatesPlaceholderPdf() {
    return this._positiveCoordinatesPlaceholderPdf.content;
  }

  get negativeCoordinatesPlaceholderPdf() {
    return this._negativeCoordinatesPlaceholderPdf.content;
  }

  get differentPlaceholderPdf() {
    return this._differentPlaceholderPdf.content;
  }
  
  get noInfoPlaceholderPdf() {
    return this._noInfoPlaceholderPdf.content;
  }

  get jpgImagePlaceholderPdf() {
    return this._jpgImagePlaceholderPdf.content;
  }

  get pngImagePlaceholderPdf() {
    return this._pngImagePlaceholderPdf.content;
  }

  get signatureJpgImage() {
    return this._signatureJpgImage.content;
  }
  
  get signaturePngImage() {
    return this._signaturePngImage.content;
  }
  
  get signedPdf() {
    return this._signedPdf.content;
  }

  get positiveCoordinatesSignedPdf() {
    return this._positiveCoordinatesSignedPdf.content;
  }

  get negativeCoordinatesSignedPdf() {
    return this._negativeCoordinatesSignedPdf.content;
  }

  get twiceSignedPdf() {
    return this._twiceSignedPdf.content;
  }

  get jpgImageTwiceSignedPdf() {
    return this._jpgImageTwiceSignedPdf.content;
  }

  get pngImageTwiceSignedPdf() {
    return this._pngImageTwiceSignedPdf.content;
  }

  get tamperedSignedPdf() {
    return this._tamperedSignedPdf.content;
  }

  get tamperedOnlyFirstTwiceSignedPdf() {
    return this._tamperedOnlyFirstTwiceSignedPdf.content;
  }

  get tamperedAppendedSignedPdf() {
    return this._tamperedAppendedSignedPdf.content;
  }

  get checkSignedPdf() {
    return this.transformPdfCheckResult(this._checkSignedPdf.content);
  }

  get checkTwiceSignedPdf() {
    return this.transformPdfCheckResult(this._checkTwiceSignedPdf.content);
  }

  get checkTamperedSignedPdf() {
    return this.transformPdfCheckResult(this._checkTamperedSignedPdf.content);
  }

  get checkTamperedOnlyFirstTwiceSignedPdf() {
    return this.transformPdfCheckResult(this._checkTamperedOnlyFirstTwiceSignedPdf.content);
  }

  get checkTamperedAppendedSignedPdf() {
    return this.transformPdfCheckResult(this._checkTamperedAppendedSignedPdf.content);
  }

  private transformPdfCheckResult(check: any): PdfCheckResult {
    return {
      ...check,
      signatures: check.signatures.map((signature: any) => this.transformSignatureCheckResult(signature))
    }
  }

  private transformSignatureCheckResult(check: any): SignatureCheckResult {
    return {
      ...check,
      details: this.transformSignatureDetails(check.details)
    }
  }

  private transformSignatureDetails(details: any): SignatureDetails {

    details = { ...details };
    if(details.date) {
      details.date = new Date(Date.parse(details.date));
    }

    return details;
  }
};

export const pdfSignerAssets13 = new PdfSignerAssets13();

