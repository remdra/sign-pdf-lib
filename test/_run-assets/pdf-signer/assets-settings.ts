import { BinaryAssetFile } from '../../_helpers/assets/binary-asset-file';
import { TextAssetFile } from '../../_helpers/assets/text-asset-file';
import * as path from 'path';

const _paths = {
    p12Certificate: path.join('test', '_assets', 'pdf-signer', 'settings', 'certificate.p12'),
    pemCertificate: path.join('test', '_assets', 'pdf-signer', 'settings', 'certificate.pem'),
    pemKey:         path.join('test', '_assets', 'pdf-signer', 'settings', 'key.pem')
};


class SettingsAssets {
  
    private _p12Certificate = new BinaryAssetFile(_paths.p12Certificate);
    private _pemCertificate = new TextAssetFile(_paths.pemCertificate);
    private _pemKey = new TextAssetFile(_paths.pemKey);

    public paths = {
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

export const settingsAssets = new SettingsAssets();
