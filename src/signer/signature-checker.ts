import { PdfSigningDocument } from "./pdf-signing-document";
import { PdfVerifySignaturesResult, VerifySignatureResult } from "../models";
import { getSignatureDetails, getSignatureName } from "../helpers";

import { PDFDict, PDFName } from "pdf-lib";
import * as forge from 'node-forge';
import * as _ from 'lodash';


function getMessageFromSignature(signature: string) {
    const p7Asn1 = forge.asn1.fromDer(signature, false);
    return forge.pkcs7.messageFromAsn1(p7Asn1);
} 

export class SignatureChecker {

    #signingDoc: PdfSigningDocument;

    static async fromPdfAsync(pdf: Buffer): Promise<SignatureChecker> {
        const signingDoc = await PdfSigningDocument.fromPdfAsync(pdf);

        return new SignatureChecker(signingDoc);
    }

    private constructor(signingDoc: PdfSigningDocument) {
        this.#signingDoc = signingDoc;
    }

    async verifySignaturesAsync(): Promise<PdfVerifySignaturesResult | undefined> {
        const signatures = this.#signingDoc.getSignatures();
        
        if(_.isEmpty(signatures)) {
            return undefined;
        }

        const checks: VerifySignatureResult[] = [];
        let integrity = true;
        for(let i = 0; i < signatures.length; i++) {
            const signature = signatures[i];
            const check = await this.verifySignatureAsync(signature, i == signatures.length - 1);
            checks.push(check);
            if('integrity' in check ) {
                integrity = integrity && check.integrity;
            } else if( i !== signatures.length - 1) {
                integrity = false;
            }
        }

        return {
            integrity,
            signatures: checks
        };
    } 

    private async verifySignatureAsync(signature: PDFDict, isLast: boolean): Promise<VerifySignatureResult> {
        if(!signature.get(PDFName.of('V'))) {
            return {
                name: getSignatureName(signature),
                isField: true
            };
        }
    
        const signBuffer = this.#signingDoc.getSignatureBuffer(signature); 
        const signatureHexStr = this.#signingDoc.getSignatureHexString(signature);
        const signatureStr = Buffer.from(signatureHexStr, 'hex').toString('latin1');
        
        const message = getMessageFromSignature(signatureStr);

        const appended = isLast && !this.#signingDoc.isSignatureForEntireDocument(signature);
        
        const { 
            rawCapture: {
                authenticatedAttributes,
                 digestAlgorithm,
            },
        } = message;
        const hashAlgorithmOid = forge.asn1.derToOid(digestAlgorithm);
        const hashAlgorithm = forge.pki.oids[hashAlgorithmOid].toLowerCase();
        const messageDigestAttr = forge.pki.oids.messageDigest;
        const fullAttrDigest = authenticatedAttributes.find((attr: any) => forge.asn1.derToOid(attr.value[0].value) === messageDigestAttr);
        const attrDigest = fullAttrDigest.value[1].value[0].value;
        const dataDigest = (forge.md as any)[hashAlgorithm]
            .create()
            .update(signBuffer.toString('latin1'))
            .digest()
            .getBytes();

        const integrity = dataDigest === attrDigest;
    
        return {
            name: getSignatureName(signature),
            integrity: integrity && !appended,
            details: getSignatureDetails(signature.lookup(PDFName.of('V'), PDFDict))
        };
    }

}
