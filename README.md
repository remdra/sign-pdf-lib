# pdf-sign

Signs pdf files. Uses [pdf-lib](https://www.npmjs.com/package/pdf-lib) to add signature to pdf files and [node-forge](https://www.npmjs.com/package/node-forge) to sign documents and verify the integrity of signed documents. 

## Installation
```
npm i sign-pdf-lib
```

# Usage
## Preparation

Instantiate signer:
```
const settings: SignatureSettings {
    signatureLength: ...,
    rangePlaceHolder: ...,

    p12Certificate: await fse.readFile(...),
    certificatePassword: '...'
}
const pdfSigner = new PdfSigner(settings);
```
or
```
const settings: SignatureSettings {
    signatureLength: ...,
    rangePlaceHolder: ...,

    pemCertificate: await fse.readFile(..., 'ascii'),
    pemKey: await fse.readFile(..., 'ascii'),
    certificatePassword: '...'
}
const pdfSigner = new PdfSigner(settings);
```
Prepare signature info:
```
const info: SignatureInfo = {
    pageNumber: 1,

    name: 'Test Signer',
    location: 'Timisoara',
    reason: 'Signing',
    modified: new Date(2023, 1, 20, 18, 47, 35), 
    contactInfo: 'signer@semnezonline.ro',

    visual: {
        jpgImage: pdfSignerAssets13.signatureImage,
        imageRectangle: { 
            left: 50, 
            top: 641, 
            right: 264, 
            bottom: 711
        }
    }
};
```

For non visual signatures, just omit visual field:
```
const info: SignatureInfo = {
    pageNumber: 1,

    name: 'Test Signer',
    location: 'Timisoara',
    reason: 'Signing',
    modified: new Date(2023, 1, 20, 18, 47, 35), 
    contactInfo: 'signer@semnezonline.ro',
};
```

## Sign PDF
```
const pdf = await fse.readFile(...); 
const signedPdf = await pdfSigner.signAsync(pdf, info);
```
          
## Add signaturePlaceholder
```
const pdf = await fse.readFile(...); 
const placeholderPdf = await pdfSigner.addPlaceholderAsync(pdf, info);
```

## Verify signatures
```
const pdf = await fse.readFile(...); 
const checks = await pdfSigner.verifySignaturesAsync(pdf);
```
IMPORTANT!: This function checks only the integrity of signatures (if the document has been changed after it has been signed).
