import { BinaryAssetFile } from '../../_helpers/assets';
import { commonAssets } from '../_assets-common';

import * as path from 'path';

const baseFolder = path.join('test', '_assets', 'signer', 'signature-embeder'); 

function getPath(file: string) {
  return path.join(baseFolder, file);
}

const _paths = {
  pdf:         getPath('pdf.pdf'),
  signedPdf:   getPath('pdf-signed.pdf'),
  placeholder: getPath('pdf-placeholder.pdf'),
  signBuffer:  getPath('sign-buffer.bin'),
  signature:   getPath('signature.bin')
};


class SignatureEmbederAssets {
  
  private _pdf         = new BinaryAssetFile(_paths.pdf);
  private _signedPdf   = new BinaryAssetFile(_paths.signedPdf);
  private _placeholder = new BinaryAssetFile(_paths.placeholder);
  private _signBuffer  = new BinaryAssetFile(_paths.signBuffer);
  private _signature   = new BinaryAssetFile(_paths.signature);

  public paths = {
    pdf:         _paths.pdf,
    signedPdf:   _paths.signedPdf,
    placeholder: _paths.placeholder,
    signBuffer:  _paths.signBuffer,
    signature:   _paths.signature
  }

  get pdf() {
    return this._pdf.content;
  }

  get signedPdf() {
    return this._signedPdf.content;
  }

  get placeholder() {
    return this._placeholder.content;
  }

  get signBuffer() {
    return this._signBuffer.content;
  }

  get signature() {
    return this._signature.content;
  }

  get p12Certificate() {
    return commonAssets.p12Certificate;
  }
};

export const signatureEmbederAssets = new SignatureEmbederAssets();
