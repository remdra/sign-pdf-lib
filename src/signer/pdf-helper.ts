import { PDFName, PDFString } from "pdf-lib";

import { PdfVerifySignaturesResult, SignatureField } from "../models";
import {
  AddFieldParameters,
  SignDigitalParameters,
} from "../models/parameters";
import { SignatureSettings } from "../models/settings";
import { PdfDocumentDigitalSigner } from "./pdf-document-digital-signer";
import { PdfSigningDocument } from "./pdf-signing-document";
import { SignatureChecker } from "./signature-checker";

export async function addPlaceholderAsync(
  pdf: Buffer,
  info: SignDigitalParameters,
  signatureInfo: SignatureSettings
): Promise<Buffer> {
  const pdfDocSigner = await PdfDocumentDigitalSigner.fromPdfAsync(pdf);
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
  pdf: Buffer,
  info: AddFieldParameters
): Promise<Buffer> {
  const pdfDocSigner = await PdfDocumentDigitalSigner.fromPdfAsync(pdf);
  const pageIndex = info.pageNumber - 1;
  const rectangle = info.rectangle;
  const embedFont = false;
  const name = info.name;
  pdfDocSigner.addSignatureField({ name, pageIndex, rectangle, embedFont });

  return pdfDocSigner.saveAsync();
}

export async function verifySignaturesAsync(
  pdf: Buffer
): Promise<PdfVerifySignaturesResult | undefined> {
  const signatureChecker = await SignatureChecker.fromPdfAsync(pdf);
  return await signatureChecker.verifySignaturesAsync();
}

export async function getFieldsAsync(pdf: Buffer): Promise<SignatureField[]> {
  const signingDoc = await PdfSigningDocument.fromPdfAsync(pdf);
  return signingDoc.getFields().map((field) => {
    const name = field.lookup(PDFName.of("T"), PDFString).asString();
    const pageNumber = signingDoc.getSignaturePageNumber(name);
    return {
      name,
      pageNumber,
    };
  });
}

export function getPlaceholderParameters(settings: SignatureSettings) {
  return {
    signaturePlaceholder: "A".repeat(settings.signatureLength),
    rangePlaceHolder: settings.rangePlaceHolder,
  };
}
