import { PdfVerifySignaturesResult, SignatureField } from "../models";
import {
  SignFieldParameters,
  AddFieldParameters,
  SignVisualParameters,
  SignDigitalParameters,
} from "../models/parameters";
import { SignerSettings } from "../models/settings";
import { PdfDigitalSigner } from "./pdf-digital-signer";
import { PdfVisualSigner } from "./pdf-visual-signer";

export class PdfSigner {
  #digitalSigner: PdfDigitalSigner;
  #visualSigner: PdfVisualSigner;

  constructor(settings: SignerSettings) {
    this.#digitalSigner = new PdfDigitalSigner(settings);
    this.#visualSigner = new PdfVisualSigner();
  }

  public async addPlaceholderAsync(
    pdf: Buffer,
    info: SignDigitalParameters
  ): Promise<Buffer> {
    return this.#digitalSigner.addPlaceholderAsync(pdf, info);
  }

  public async addFieldAsync(
    pdf: Buffer,
    info: AddFieldParameters
  ): Promise<Buffer> {
    return this.#digitalSigner.addFieldAsync(pdf, info);
  }

  public async signAsync(
    pdf: Buffer,
    info: SignDigitalParameters
  ): Promise<Buffer> {
    return this.#digitalSigner.signAsync(pdf, info);
  }

  public async signFieldAsync(
    pdf: Buffer,
    info: SignFieldParameters
  ): Promise<Buffer> {
    return this.#digitalSigner.signFieldAsync(pdf, info);
  }

  public async signVisualAsync(
    pdf: Buffer,
    info: SignVisualParameters
  ): Promise<Buffer> {
    return this.#visualSigner.signAsync(pdf, info);
  }

  public async verifySignaturesAsync(
    pdf: Buffer
  ): Promise<PdfVerifySignaturesResult | undefined> {
    return this.#digitalSigner.verifySignaturesAsync(pdf);
  }

  public async getFieldsAsync(pdf: Buffer): Promise<SignatureField[]> {
    return this.#digitalSigner.getFieldsAsync(pdf);
  }
}
