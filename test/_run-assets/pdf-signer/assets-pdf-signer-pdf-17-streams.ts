import { transformPdfCheckResult } from '../../_helpers/check-result-helpers';
import { BinaryAssetFile } from '../../_helpers/assets/binary-asset-file';
import { JsonAssetFile } from '../../_helpers/assets/json-asset-file';
import * as path from 'path';

const _paths = {
  pdf:            path.join('test', '_assets', 'pdf-signer', 'pdf-17-streams', 'document.pdf'),

  placeholderPdf: path.join('test', '_assets', 'pdf-signer', 'pdf-17-streams', 'placeholder.pdf'),
  positiveCoordinatesPlaceholderPdf: path.join('test', '_assets', 'pdf-signer', 'pdf-17-streams', 'placeholder-positive-coordinates.pdf'),
  negativeCoordinatesPlaceholderPdf: path.join('test', '_assets', 'pdf-signer', 'pdf-17-streams', 'placeholder-negative-coordinates.pdf'),
  differentPlaceholderPdf: path.join('test', '_assets', 'pdf-signer', 'pdf-17-streams', 'placeholder-different.pdf'),
  noInfoPlaceholderPdf: path.join('test', '_assets', 'pdf-signer', 'pdf-17-streams', 'placeholder-no-info.pdf'),
  jpgImagePlaceholderPdf: path.join('test', '_assets', 'pdf-signer', 'pdf-17-streams', 'placeholder-jpg-image.pdf'),
  pngImagePlaceholderPdf: path.join('test', '_assets', 'pdf-signer', 'pdf-17-streams', 'placeholder-png-image.pdf'),

  signatureJpgImage: path.join('test', '_assets', 'pdf-signer', 'signature.jpg'),
  signaturePngImage: path.join('test', '_assets', 'pdf-signer', 'signature.png'),

  signedPdf:      path.join('test', '_assets', 'pdf-signer', 'pdf-17-streams', 'signed.pdf'),
  positiveCoordinatesSignedPdf:      path.join('test', '_assets', 'pdf-signer', 'pdf-17-streams', 'signed-positive-coordinates.pdf'),
  negativeCoordinatesSignedPdf:      path.join('test', '_assets', 'pdf-signer', 'pdf-17-streams', 'signed-negative-coordinates.pdf'),
  twiceSignedPdf: path.join('test', '_assets', 'pdf-signer', 'pdf-17-streams', 'signed-twice.pdf'),
  jpgImageTwiceSignedPdf: path.join('test', '_assets', 'pdf-signer', 'pdf-17-streams', 'signed-twice-jpg-image.pdf'),
  pngImageTwiceSignedPdf: path.join('test', '_assets', 'pdf-signer', 'pdf-17-streams', 'signed-twice-png-image.pdf'),

  tamperedSignedPdf:      path.join('test', '_assets', 'pdf-signer', 'pdf-17-streams', 'tampered-signed.pdf'),
  tamperedOnlyFirstTwiceSignedPdf: path.join('test', '_assets', 'pdf-signer', 'pdf-17-streams', 'tampered-signed-twice-only-first-tampered.pdf'),
  tamperedAppendedSignedPdf:      path.join('test', '_assets', 'pdf-signer', 'pdf-17-streams', 'tampered-signed-appended.pdf'),

  checkSignedPdf:      path.join('test', '_assets', 'pdf-signer', 'pdf-17-streams', 'signed.check.json'),
  checkTwiceSignedPdf: path.join('test', '_assets', 'pdf-signer', 'pdf-17-streams', 'signed-twice.check.json'),
  
  checkTamperedSignedPdf:      path.join('test', '_assets', 'pdf-signer', 'pdf-17-streams', 'tampered-signed.check.json'),
  checkTamperedOnlyFirstTwiceSignedPdf:      path.join('test', '_assets', 'pdf-signer', 'pdf-17-streams', 'tampered-signed-twice-only-first-tampered.check.json'),
  checkTamperedAppendedSignedPdf:      path.join('test', '_assets', 'pdf-signer', 'pdf-17-streams', 'tampered-signed-appended.check.json'),

  signedVisualPdf:      path.join('test', '_assets', 'pdf-signer', 'pdf-17-streams', 'visual-signed.pdf'),
  positiveCoordinatesSignedVisualPdf:      path.join('test', '_assets', 'pdf-signer', 'pdf-17-streams', 'visual-signed-positive-coordinates.pdf'),
  negativeCoordinatesSignedVisualPdf:      path.join('test', '_assets', 'pdf-signer', 'pdf-17-streams', 'visual-signed-negative-coordinates.pdf'),

  jpgImageTwiceSignedVisualPdf: path.join('test', '_assets', 'pdf-signer', 'pdf-17-streams', 'visual-signed-twice-jpg-image.pdf'),
  pngImageTwiceSignedVisualPdf: path.join('test', '_assets', 'pdf-signer', 'pdf-17-streams', 'visual-signed-twice-png-image.pdf'),
};


class PdfSignerAssets17Streams {
  
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

  private _signedVisualPdf = new BinaryAssetFile(_paths.signedVisualPdf);
  private _positiveCoordinatesSignedVisualPdf = new BinaryAssetFile(_paths.positiveCoordinatesSignedVisualPdf);
  private _negativeCoordinatesSignedVisualPdf = new BinaryAssetFile(_paths.negativeCoordinatesSignedVisualPdf);

  private _jpgImageTwiceSignedVisualPdf = new BinaryAssetFile(_paths.jpgImageTwiceSignedVisualPdf);
  private _pngImageTwiceSignedVisualPdf = new BinaryAssetFile(_paths.pngImageTwiceSignedVisualPdf);

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
    checkTamperedAppendedSignedPdf: _paths.checkTamperedAppendedSignedPdf,

    signedVisualPdf: _paths.signedVisualPdf,
    positiveCoordinatesSignedVisualPdf: _paths.positiveCoordinatesSignedVisualPdf,
    negativeCoordinatesSignedVisualPdf: _paths.negativeCoordinatesSignedVisualPdf,

    jpgImageTwiceSignedVisualPdf: _paths.jpgImageTwiceSignedVisualPdf,
    pngImageTwiceSignedVisualPdf: _paths.pngImageTwiceSignedVisualPdf,
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
    return transformPdfCheckResult(this._checkSignedPdf.content);
  }

  get checkTwiceSignedPdf() {
    return transformPdfCheckResult(this._checkTwiceSignedPdf.content);
  }

  get checkTamperedSignedPdf() {
    return transformPdfCheckResult(this._checkTamperedSignedPdf.content);
  }

  get checkTamperedOnlyFirstTwiceSignedPdf() {
    return transformPdfCheckResult(this._checkTamperedOnlyFirstTwiceSignedPdf.content);
  }

  get checkTamperedAppendedSignedPdf() {
    return transformPdfCheckResult(this._checkTamperedAppendedSignedPdf.content);
  }

  get signedVisualPdf() {
    return this._signedVisualPdf.content;
  }

  get positiveCoordinatesSignedVisualPdf() {
    return this._positiveCoordinatesSignedVisualPdf.content;
  }

  get negativeCoordinatesSignedVisualPdf() {
    return this._negativeCoordinatesSignedVisualPdf.content;
  }

  get jpgImageTwiceSignedVisualPdf() {
    return this._jpgImageTwiceSignedVisualPdf.content;
  }

  get pngImageTwiceSignedVisualPdf() {
    return this._pngImageTwiceSignedVisualPdf.content;
  }
};

export const pdfSignerAssets17Streams = new PdfSignerAssets17Streams();

