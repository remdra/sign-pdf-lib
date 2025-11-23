import { PdfVerifySignaturesResult, SignatureField } from "../models";
import {
  SignFieldParameters,
  AddFieldParameters,
  SignDigitalParameters,
} from "../models/parameters";
import { SignerSettings } from "../models/settings";
import { PdfDocumentDigitalSigner } from "./pdf-document-digital-signer";
import { SignatureEmbeder } from "./signature-embeder";
import { SignatureComputer } from "./signature-computer";
import {
  addFieldAsync,
  addPlaceholderAsync,
  getFieldsAsync,
  getPlaceholderParameters,
  verifySignaturesAsync,
} from "./pdf-helper";

export class PdfDigitalSigner {
  #settings: SignerSettings;
  #signatureComputer: SignatureComputer;

  constructor(settings: SignerSettings) {
    this.#settings = settings;
    this.#signatureComputer = new SignatureComputer(settings.signatureComputer);
  }

  public async addPlaceholderAsync(
    pdf: ArrayBuffer | Buffer | Uint8Array, /*tested*/
    info: SignDigitalParameters
  ): Promise<Uint8Array> {
    return await addPlaceholderAsync(pdf, info, this.#settings.signature);
  }

  public async addFieldAsync(
    pdf: ArrayBuffer | Buffer | Uint8Array, /*tested*/
    info: AddFieldParameters
  ): Promise<Uint8Array> {
    return await addFieldAsync(pdf, info);
  }

  public async signAsync(
    pdf: ArrayBuffer | Buffer | Uint8Array, /*tested*/
    info: SignDigitalParameters
  ): Promise<Uint8Array> {
    const placeholderPdf = await this.addPlaceholderAsync(pdf, info);
    const signatureDate = info.signature?.date;
    return await this.signLastPlaceholderAsync(placeholderPdf, signatureDate);
  }

  public async signFieldAsync(
    pdf: ArrayBuffer | Buffer | Uint8Array, /*tested*/
    info: SignFieldParameters
  ): Promise<Uint8Array> {
    const placeholderParameters = getPlaceholderParameters(this.#settings.signature);
    const placeholderPdf = await PdfDocumentDigitalSigner.addSignaturePlaceholderForFieldAsync(
      pdf,
      info.fieldName,
      placeholderParameters,
      info.signature,
      info.visual
    );
    const signatureDate = info.signature?.date;
    return await this.signLastPlaceholderAsync(placeholderPdf, signatureDate);
  }

  public async verifySignaturesAsync(
    pdf: ArrayBuffer | Buffer /*tested*/
  ): Promise<PdfVerifySignaturesResult | undefined> {
    return await verifySignaturesAsync(pdf);
  }

  public async getFieldsAsync(pdf: ArrayBuffer | Buffer): Promise<SignatureField[]> { /*tested*/
    return await getFieldsAsync(pdf);
  }

  private async signLastPlaceholderAsync(
    placeholderPdf: Uint8Array, /*tested*/
    signatureDate?: Date
  ): Promise<Uint8Array> {
    const signatureEmbeder = await SignatureEmbeder.fromPdfAsync(placeholderPdf);
    const toBeSignedBuffer = signatureEmbeder.getSignBuffer();
    const signature = this.#signatureComputer.computeSignature(
      toBeSignedBuffer,
      signatureDate
    );
    return signatureEmbeder.embedSignature(signature);
  }
}
