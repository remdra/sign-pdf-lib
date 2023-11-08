import { BinaryAssetFile } from '../../_helpers/assets/binary-asset-file';
import * as path from 'path';

const _paths = {
  fieldPdf: path.join('test', '_assets', 'pdf-signer', 'pdf-regression', 'field.pdf'),
  fieldSignedPdf: path.join('test', '_assets', 'pdf-signer', 'pdf-regression', 'field-signed.pdf'),
};


class PdfSignerAssetsRegression {
  
  private _fieldPdf = new BinaryAssetFile(_paths.fieldPdf);
  private _fieldSignedPdf = new BinaryAssetFile(_paths.fieldSignedPdf);

  public paths = {
    fieldPdf: _paths.fieldPdf,
    fieldSignedPdf: _paths.fieldSignedPdf
  }

  get fieldPdf() {
    return this._fieldPdf.content;
  }

  get fieldSignedPdf() {
    return this._fieldSignedPdf.content;
  }
};

export const pdfSignerAssetsRegression = new PdfSignerAssetsRegression();
