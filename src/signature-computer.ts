import * as forge from 'node-forge';
import { PDFString } from 'pdf-lib';

interface SigningSettings {
    privateKey: any;
    certificate: any;
    certificates: any[];
}

export interface SignatureComputerSettings {
    p12Certificate?: Buffer;
    pemCertificate?: string;
    pemKey?: string;
    certificatePassword: string;
}

function getSigningSettingsP12(p12Certificate: Buffer, certificatePassword: string): SigningSettings {
    const forgeCert = forge.util.createBuffer(p12Certificate.toString('binary'));
    const p12Asn1 = forge.asn1.fromDer(forgeCert);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, certificatePassword);

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


function getSigningSettingsPem(pemCertificate: string, pemKey: string, certificatePassword: string): SigningSettings {
    const privateKey = forge.pki.decryptRsaPrivateKey(pemKey, certificatePassword);
    var certificate = forge.pki.certificateFromPem(pemCertificate);

    return {
        privateKey,
        certificate,
        certificates: [ certificate ]
    };
}

export class SignatureComputer {

    #settings: SignatureComputerSettings;

    constructor(settings: SignatureComputerSettings) {
        this.#settings = settings;
    }

    computeSignature(signBuffer: Buffer, date: Date): Buffer {
        const { privateKey, certificates, certificate } = this.getSigningSettings();

        const p7 = forge.pkcs7.createSignedData();
        p7.content = forge.util.createBuffer(signBuffer.toString('binary'));
        certificates.forEach(cert => p7.addCertificate(cert));
        p7.addSigner({
            key: privateKey,
            certificate,
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

    private getSigningSettings() : SigningSettings {
        if(this.#settings.pemCertificate && this.#settings.pemKey) {
            return getSigningSettingsPem(this.#settings.pemCertificate, this.#settings.pemKey, this.#settings.certificatePassword);
        } else if(this.#settings.p12Certificate) {
            return getSigningSettingsP12(this.#settings.p12Certificate, this.#settings.certificatePassword);
        } else {
            throw new Error('No certificate specified.');
        }
    }
}
