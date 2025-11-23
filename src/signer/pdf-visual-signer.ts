import { SignVisualParameters } from "../models/parameters";
import { PdfDocumentVisualSigner } from "./pdf-document-visual-signer";

export class PdfVisualSigner {
  public async signAsync(
    pdf: ArrayBuffer | Buffer,/*tested*/
    { pageNumber, rectangle, ...visual }: SignVisualParameters
  ): Promise<Uint8Array> {
    const pdfDocSigner = await PdfDocumentVisualSigner.fromPdfAsync(pdf);/*testing*/
    const pageIndex = pageNumber - 1;
    await pdfDocSigner.addVisualSignatureAsync({
      pageIndex,
      rectangle,
      ...visual,
    });
    return pdfDocSigner.saveAsync();
  }
}
