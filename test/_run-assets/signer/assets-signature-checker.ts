import { BinaryAssetFile } from '../../_helpers/assets';

import * as path from 'path';

const baseFolder = path.join('test', '_assets', 'signer', 'signature-checker');

function getPath(file: string) {
  return path.join(baseFolder, file);
}

const _paths = {
  pdf:       getPath('pdf.pdf'),
};


class SignatureCheckerAssets {
  
  private _pdf = new BinaryAssetFile(_paths.pdf);

  public paths = {
    pdf: _paths.pdf,
  }

  get pdf() {
    return this._pdf.content;
  }
};

export const signatureCheckerAssets = new SignatureCheckerAssets();
