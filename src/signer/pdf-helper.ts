import { PDFName, PDFString } from "pdf-lib";

import { PdfVerifySignaturesResult, SignatureField } from "../models";
import {
  AddFieldParameters,
  PlaceholderParameters,
  SignDigitalParameters,
} from "../models/parameters";
import { SignatureSettings } from "../models/settings";
import { PdfDocumentDigitalSigner } from "./pdf-document-digital-signer";
import { SignDocumentBasic } from "./new-sign-document-basic";
import { SignatureChecker } from "./signature-checker";

export async function addPlaceholderAsync(
  pdf: ArrayBuffer | Buffer | Uint8Array, /*tested*/
  info: SignDigitalParameters,
  signatureInfo: SignatureSettings
): Promise<Uint8Array> {
  const pdfDocSigner = await PdfDocumentDigitalSigner.fromPdfAsync(pdf); /*testing*/
  const pageIndex = info.pageNumber - 1;
  const { background, texts } = info.visual ?? {};
  const visualRef = await pdfDocSigner.addVisualAsync({ background, texts });
  const placeholderInfo = getPlaceholderParameters(signatureInfo);
  const placeholderRef = pdfDocSigner.addSignaturePlaceholder({
    ...info.signature,
    ...placeholderInfo,
  });
  const rectangle = info.visual?.rectangle;
  const embedFont = !!(info.visual && info.visual?.texts);
  const name = info.name;
  pdfDocSigner.addSignatureField({
    name,
    pageIndex,
    rectangle,
    visualRef,
    placeholderRef,
    embedFont,
  });
  return pdfDocSigner.saveAsync();
}

export async function addFieldAsync(
  pdf: ArrayBuffer | Buffer | Uint8Array, /*tested*/
  info: AddFieldParameters
): Promise<Uint8Array> {
  const pdfDocSigner = await PdfDocumentDigitalSigner.fromPdfAsync(pdf);/*testing*/
  const pageIndex = info.pageNumber - 1;
  const rectangle = info.rectangle;
  const embedFont = false;
  const name = info.name;
  pdfDocSigner.addSignatureField({ name, pageIndex, rectangle, embedFont });

  return pdfDocSigner.saveAsync();
}

export async function verifySignaturesAsync(
  pdf: ArrayBuffer | Buffer /*tested*/
): Promise<PdfVerifySignaturesResult | undefined> {
  const signatureChecker = await SignatureChecker.fromPdfAsync(pdf);/*testing*/
  return await signatureChecker.verifySignaturesAsync();
}

export async function getFieldsAsync(pdf: ArrayBuffer | Buffer): Promise<SignatureField[]> {
  const signingDoc = await SignDocumentBasic.fromPdfAsync(pdf);
  return signingDoc.getFields().map((field) => {
    const name = field.lookup(PDFName.of("T"), PDFString).asString();
    const pageNumber = signingDoc.getSignaturePageNumber(name);
    return {
      name,
      pageNumber,
    };
  });
}

export function getPlaceholderParameters(settings: SignatureSettings): PlaceholderParameters {
  return {
    signaturePlaceholder: "A".repeat(settings.signatureLength),
    rangePlaceHolder: settings.rangePlaceHolder,
  };
}
