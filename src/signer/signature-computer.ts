import { P12SignatureComputerSettings, PemSignatureComputerSettings, SignatureComputerSettings } from '../models/settings/signature-computer-settings';

import * as forge from 'node-forge';
import { PDFString } from 'pdf-lib';

interface SigningSettings {
    privateKey: any;
    certificate: any;
    certificates: any[];
}

function getSigningSettingsP12(settings: P12SignatureComputerSettings): SigningSettings {
    const forgeCert = forge.util.createBuffer(settings.certificate.toString('binary'));
    const p12Asn1 = forge.asn1.fromDer(forgeCert);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, settings.password);

    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag];
    if(!certBags) {
        throw new Error('Invalid "certBags".');
    }
    const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag];
    if(!keyBags) {
        throw new Error('Invalid "keyBags".');
    }

    const privateKey = keyBags[0].key as any;
    if(!privateKey) {
        throw new Error('Invalid "privateKey".');
    }

    const certificates: any[] = [];
    let certificate;
    Object.keys(certBags).forEach((i) => {
        const cert = (certBags as any)[i].cert;
        const { publicKey } = cert;

        certificates.push(cert);

        if (privateKey.n.compareTo(publicKey.n) === 0
            && privateKey.e.compareTo(publicKey.e) === 0
        ) {
            certificate = cert;
        }
    });

    if (typeof certificate === 'undefined') {
        throw new Error('Failed to find a certificate that matches the private key.');
    }

    return {
        privateKey,
        certificate,
        certificates
    };
}


function getSigningSettingsPem(settings: PemSignatureComputerSettings): SigningSettings {
    const privateKey = forge.pki.decryptRsaPrivateKey(settings.key, settings.password);
    var certificate = forge.pki.certificateFromPem(settings.certificate);

    return {
        privateKey,
        certificate,
        certificates: [ certificate ]
    };
}

function getSigningSettings(settings: SignatureComputerSettings) : SigningSettings {
    if('certificate' in settings && 'key' in settings) {
        return getSigningSettingsPem(settings);
    } else {
        return getSigningSettingsP12(settings);
    }
}


export class SignatureComputer {

    #settings: SigningSettings;

    constructor(settings: SignatureComputerSettings) {
        this.#settings = getSigningSettings(settings);
    }

    computeSignature(signBuffer: Buffer, date: Date): Buffer {
        const p7 = forge.pkcs7.createSignedData();
        p7.content = forge.util.createBuffer(signBuffer.toString('binary'));
        this.#settings.certificates.forEach(cert => p7.addCertificate(cert));
        p7.addSigner({
            key: this.#settings.privateKey,
            certificate: this.#settings.certificate,
            digestAlgorithm: forge.pki.oids.sha256,
            authenticatedAttributes: [
                {
                    type: forge.pki.oids.contentType,
                    value: forge.pki.oids.data
                }, {
                    type: forge.pki.oids.messageDigest
                }, {
                    type: forge.pki.oids.signingTime,
                    value: PDFString.fromDate(date).asString()
                }
            ],
        });

        p7.sign({ detached: true });

        return Buffer.from(forge.asn1.toDer(p7.toAsn1()).getBytes(), 'binary');
    }
}
