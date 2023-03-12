import * as fse from 'fs-extra';
import { pathProvider } from '../path-provider';


export interface SignatureSettings {
    signatureLength: number;
    rangePlaceHolder: number;

    p12Certificate?: Buffer,
    pemCertificate?: string,
    pemKey?: string,
    certificatePassword: string
}

export const defaultSignatureSettings: SignatureSettings = {
    signatureLength: 4000 - 6,
    rangePlaceHolder: 9999999,
    
    p12Certificate: fse.readFileSync(pathProvider.getCertificatePath()),
    pemCertificate: fse.readFileSync(pathProvider.getPemCertificatePath(), 'ascii'),
    pemKey: fse.readFileSync(pathProvider.getPemKeyPath(), 'ascii'),
    certificatePassword: 'password'
};
