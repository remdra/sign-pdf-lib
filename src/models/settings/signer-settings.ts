import { SignatureComputerSettings } from './signature-computer-settings';

export interface SignerSettings {
    signatureLength: number;
    rangePlaceHolder: number;

    signatureComputer: SignatureComputerSettings;
}
