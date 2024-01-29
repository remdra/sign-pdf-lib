import { BinaryAssetFile } from '../../_helpers/assets';
import { commonAssets } from '../_assets-common';

import * as path from 'path';

const baseFolder = path.join('test', '_assets', 'signer', 'signature-computer');

function getPath(file: string) {
  return path.join(baseFolder, file);
}

const _paths = {
  pdf:       getPath('pdf.pdf'),
  signature: getPath('signature.bin')
};


class SignatureComputerAssets {
  
  private _pdf = new BinaryAssetFile(_paths.pdf);
  private _signature = new BinaryAssetFile(_paths.signature);

  public paths = {
    pdf: _paths.pdf,
    signature: _paths.signature
  }

  get pdf() {
    return this._pdf.content;
  }

  get signature() {
    return this._signature.content;
  }

  get p12Certificate() {
    return commonAssets.p12Certificate;
  }

  get pemCertificate() {
    return commonAssets.pemCertificate;
  }

  get pemKey() {
    return commonAssets.pemKey;
  }
};

export const signatureComputerAssets = new SignatureComputerAssets();
