import { BinaryAssetFile } from '../../_helpers/assets/binary-asset-file';
import * as path from 'path';

const baseFolder = path.join('test', '_assets', 'signature-embeder'); 

const _paths = {
  pdf:         path.join(baseFolder, 'pdf.pdf'),
  signedPdf:   path.join(baseFolder, 'pdf-signed.pdf'),
  placeholder: path.join(baseFolder, 'placeholder.pdf'),
  signBuffer:  path.join(baseFolder, 'sign-buffer.bin'),
  signature:   path.join(baseFolder, 'signature.bin')
};


class EmbederAssets {
  
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
};

export const embederAssets = new EmbederAssets();
