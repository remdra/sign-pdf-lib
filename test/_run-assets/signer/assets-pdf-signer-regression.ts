import { JsonAssetFile, transformPdfCheckResult } from '../../_helpers';
import { BinaryAssetFile } from '../../_helpers/assets/binary-asset-file';

import * as path from 'path';

const baseFolder = path.join('test', '_assets', 'regression', 'pdf-signer'); 

function getPath(file: string) {
  return path.join(baseFolder, file);
}


const _paths = {
  fieldPdf:       getPath('field.pdf'),
  fieldSignedPdf: getPath('field-signed.pdf'),
  verifySignaturesPdf: getPath('verify-signatures.pdf'),
  checkResult: getPath('check-result.json')
};


class PdfSignerAssetsRegression {
  
  private _fieldPdf = new BinaryAssetFile(_paths.fieldPdf);
  private _fieldSignedPdf = new BinaryAssetFile(_paths.fieldSignedPdf);
  private _verifySignaturesPdf = new BinaryAssetFile(_paths.verifySignaturesPdf);
  private _checkResult = new JsonAssetFile(_paths.checkResult);

  public paths = {
    fieldPdf: _paths.fieldPdf,
    fieldSignedPdf: _paths.fieldSignedPdf,
    checkResult: _paths.checkResult
  }

  get fieldPdf() {
    return this._fieldPdf.content;
  }

  get fieldSignedPdf() {
    return this._fieldSignedPdf.content;
  }

  get verifySignaturesPdf() {
    return this._verifySignaturesPdf.content;
  }

  get checkResult() {
    return transformPdfCheckResult(this._checkResult.content);
  }
};

export const pdfSignerAssetsRegression = new PdfSignerAssetsRegression();
