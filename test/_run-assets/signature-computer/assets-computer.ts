import { BinaryAssetFile } from '../../_helpers/assets/binary-asset-file';
import * as path from 'path';

const baseFolder = path.join('test', '_assets', 'signature-computer', 'pdf');

function getPath(file: string) {
  return path.join(baseFolder, file);
}

const _paths = {
  pdf:       getPath('pdf.pdf'),
  signature: getPath('signature.bin')
};


class ComputerAssets {
  
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
};

export const computerAssets = new ComputerAssets();
