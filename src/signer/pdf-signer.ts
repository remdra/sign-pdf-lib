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
    pdf: ArrayBuffer | Buffer | Uint8Array,
    info: SignDigitalParameters
  ): Promise<Uint8Array> {
    return this.#digitalSigner.addPlaceholderAsync(pdf, info);
  }

  public async addFieldAsync(
    pdf: ArrayBuffer | Buffer | Uint8Array,
    info: AddFieldParameters
  ): Promise<Uint8Array> {
    return this.#digitalSigner.addFieldAsync(pdf, info);
  }

  public async signAsync(
    pdf: ArrayBuffer | Buffer | Uint8Array,
    info: SignDigitalParameters
  ): Promise<Uint8Array> {
    return this.#digitalSigner.signAsync(pdf, info);
  }

  public async signFieldAsync(
    pdf: ArrayBuffer | Buffer,
    info: SignFieldParameters
  ): Promise<Uint8Array> {
    return this.#digitalSigner.signFieldAsync(pdf, info);
  }

  public async signVisualAsync(
    pdf: ArrayBuffer | Buffer,
    info: SignVisualParameters
  ): Promise<Uint8Array> {
    return this.#visualSigner.signAsync(pdf, info);
  }

  public async verifySignaturesAsync(
    pdf: ArrayBuffer | Buffer
  ): Promise<PdfVerifySignaturesResult | undefined> {
    return this.#digitalSigner.verifySignaturesAsync(pdf);
  }

  public async getFieldsAsync(pdf: Buffer): Promise<SignatureField[]> {
    return this.#digitalSigner.getFieldsAsync(pdf);
  }
}
