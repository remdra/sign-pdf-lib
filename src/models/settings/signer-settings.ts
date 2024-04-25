import { SignatureComputerSettings } from "./signature-computer-settings";
import { SignatureSettings } from "./signature-settings";

export interface SignerSettings {
  signature: SignatureSettings;
  signatureComputer: SignatureComputerSettings;
}
