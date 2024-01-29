export interface P12SignatureComputerSettings {
    certificate: Buffer;
    password: string;
}

export interface PemSignatureComputerSettings {
    certificate: string;
    key: string;
    password: string;
}

export type SignatureComputerSettings = P12SignatureComputerSettings | PemSignatureComputerSettings;
