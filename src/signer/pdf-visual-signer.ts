import { SignVisualParameters } from "../models/parameters";
import { PdfDocumentVisualSigner } from "./pdf-document-visual-signer";

export class PdfVisualSigner {
  public async signAsync(
    pdf: Buffer,
    { pageNumber, rectangle, ...visual }: SignVisualParameters
  ): Promise<Buffer> {
    const pdfDocSigner = await PdfDocumentVisualSigner.fromPdfAsync(pdf);
    const pageIndex = pageNumber - 1;
    await pdfDocSigner.addVisualSignatureAsync({
      pageIndex,
      rectangle,
      ...visual,
    });
    return pdfDocSigner.saveAsync();
  }
}
