import * as fse from 'fs-extra';


export interface SignatureSettings {
    signatureLength: number;
    rangePlaceHolder: number;

    p12Certificate?: Buffer,
    pemCertificate?: string,
    pemKey?: string,
    certificatePassword: string
}
