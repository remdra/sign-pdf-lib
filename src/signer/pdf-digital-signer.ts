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
    pdf: ArrayBuffer | Buffer | Uint8Array,
    info: SignDigitalParameters
  ): Promise<Uint8Array> {
    return await addPlaceholderAsync(pdf, info, this.#settings.signature);
  }

  public async addFieldAsync(
    pdf: ArrayBuffer | Buffer | Uint8Array,
    info: AddFieldParameters
  ): Promise<Uint8Array> {
    return await addFieldAsync(pdf, info);
  }

  public async signAsync(
    pdf: ArrayBuffer | Buffer | Uint8Array,
    info: SignDigitalParameters
  ): Promise<Uint8Array> {
    const placeholderPdf = await this.addPlaceholderAsync(pdf, info);
    const signatureEmbeder = await SignatureEmbeder.fromPdfAsync(
      placeholderPdf
    );
    const toBeSignedBuffer = signatureEmbeder.getSignBuffer();
    const signature = this.#signatureComputer.computeSignature(
      toBeSignedBuffer,
      info.signature?.date || new Date()
    );
    return signatureEmbeder.embedSignature(signature);
  }

  public async signFieldAsync(
    pdf: ArrayBuffer | Buffer | Uint8Array,
    info: SignFieldParameters
  ): Promise<Uint8Array> {
    const pdfDocSigner = await PdfDocumentDigitalSigner.fromPdfAsync(pdf);
    const placeholderInfo = getPlaceholderParameters(this.#settings.signature);
    const placeholderRef = pdfDocSigner.addSignaturePlaceholder({
      ...info.signature,
      ...placeholderInfo,
    });
    const visualRef = await pdfDocSigner.addVisualAsync({ ...info.visual });
    const embedFont = !!(info.visual && "texts" in info.visual);
    pdfDocSigner.updateSignature(info.fieldName, {
      placeholderRef,
      visualRef,
      embedFont,
    });
    const placeholderPdf = await pdfDocSigner.saveAsync();
    const signatureEmbeder = await SignatureEmbeder.fromPdfAsync(
      placeholderPdf
    );
    const toBeSignedBuffer = signatureEmbeder.getSignBuffer();
    const signature = this.#signatureComputer.computeSignature(
      toBeSignedBuffer,
      info.signature?.date || new Date()
    );
    return signatureEmbeder.embedSignature(signature);
  }

  public async verifySignaturesAsync(
    pdf: ArrayBuffer | Buffer
  ): Promise<PdfVerifySignaturesResult | undefined> {
    return await verifySignaturesAsync(pdf);
  }

  public async getFieldsAsync(pdf: ArrayBuffer | Buffer): Promise<SignatureField[]> {
    return await getFieldsAsync(pdf);
  }
}
