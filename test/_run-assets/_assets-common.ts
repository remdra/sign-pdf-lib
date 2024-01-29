import { BinaryAssetFile, TextAssetFile } from '../_helpers/assets';

import * as path from 'path';

const baseFolder = path.join('test', '_assets', '_common'); 

function getSignaturePath(file: string) {
  return path.join(baseFolder, 'signature', file);
}

function getCertificatePath(file: string) {
  return path.join(baseFolder, 'certificate', file);
}

const _paths = {
  jpgImage: getSignaturePath('signature.jpg'),
  pngImage: getSignaturePath('signature.png'),
  badImage: getSignaturePath('signature-bad.png'),

  p12Certificate: getCertificatePath('certificate.p12'),
  pemCertificate: getCertificatePath('certificate.pem'),
  pemKey:         getCertificatePath('key.pem')
};


class CommonAssets {
  
  private _jpgImage = new BinaryAssetFile(_paths.jpgImage);
  private _pngImage = new BinaryAssetFile(_paths.pngImage);
  private _badImage = new BinaryAssetFile(_paths.badImage);

  private _p12Certificate = new BinaryAssetFile(_paths.p12Certificate);
  private _pemCertificate = new TextAssetFile(_paths.pemCertificate);
  private _pemKey = new TextAssetFile(_paths.pemKey);


  public paths = {
  }

  get jpgImage() {
    return this._jpgImage.content;
  }

  get pngImage() {
    return this._pngImage.content;
  }

  get badImage() {
    return this._badImage.content;
  }
  
  get p12Certificate() {
    return this._p12Certificate.content;
  }

  get pemCertificate() {
    return this._pemCertificate.content;
  }

  get pemKey() {
    return this._pemKey.content;
  }
};

export const commonAssets = new CommonAssets();
