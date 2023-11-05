export interface SignerSettings {
    signatureLength: number;
    rangePlaceHolder: number;

    p12Certificate?: Buffer;
    pemCertificate?: string;
    pemKey?: string;
    certificatePassword: string;
}
