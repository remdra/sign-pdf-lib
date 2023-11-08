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

## Digital signature parameters preparation:
```
const parameters: SignDigitalParameters = {
    pageNumber: 1,

    name: 'Test Signer',
    location: 'Timisoara',
    reason: 'Signing',
    contactInfo: 'signer@semnezonline.ro',

    visual: {
        background: await fse.readFile(...),
        rectangle: { 
            left: 50, 
            top: 641, 
            right: 264, 
            bottom: 711
        }
    }
};
```
IMPORTANT: if coordinate are negative, they are considered from right or bottom.

For non visual signatures, just omit visual field:
```
const parameters: SignDigitalParameters = {
    pageNumber: 1,

    name: 'Test Signer',
    location: 'Timisoara',
    reason: 'Signing',
    contactInfo: 'signer@semnezonline.ro',
};
```

## Sign PDF
```
const pdf = await fse.readFile(...); 
const signedPdf = await pdfSigner.signAsync(pdf, parameters);
```
          
## Add signature placeholder
```
const pdf = await fse.readFile(...); 
const placeholderPdf = await pdfSigner.addPlaceholderAsync(pdf, parameters);
```

## Digital signature field parameters preparation:
```
const parameters: AddFieldParameters = {
    pageNumber: 1,

    rectangle: { 
        left: 50, 
        top: 641, 
        right: 264, 
        bottom: 711
    }
};
```
IMPORTANT: if coordinate are negative, they are considered from right or bottom.

## Add signature field
```
const pdf = await fse.readFile(...); 
const fieldPdf = await pdfSigner.addFieldAsync(pdf, parameters);
```

## Get signature field list
```
const pdf = await fse.readFile(...); 
const fields = await pdfSigner.getFieldsAsync(pdf);
```

## Field signature parameters preparation:
```
const parameters: SignFieldParameters = {
    fieldName: 'Signature1,

    name: 'Test Signer',
    location: 'Timisoara',
    reason: 'Signing',
    contactInfo: 'signer@semnezonline.ro',


    background: await fse.readFile(...),
    texts: [
        {
            lines: [ 
                'JOHN', 
                'DOE'
            ]
        }, {
            lines: [ 
                'Digitally signed by', 
                'JOHN DOE', 
                'Date: 2023.11.03', 
                '20:28:46 +02\'00\''
            ]
        }
    ]
};
```

## Sign field
```
const pdf = await fse.readFile(...); 
const signedPdf = await pdfSigner.signFieldAsync(pdf, parameters);
```

## Verify signatures
```
const pdf = await fse.readFile(...); 
const checks = await pdfSigner.verifySignaturesAsync(pdf);
```
IMPORTANT!: This function checks only the integrity of signatures (if the document has been changed after it has been signed).
