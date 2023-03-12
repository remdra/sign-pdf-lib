import * as path from 'path';

export class PathProvider {

    getCertificatePath() {
        return path.join('assets', 'certificate.p12');
    }

    getPemCertificatePath() {
        return path.join('assets', 'certificate.pem');
    }

    getPemKeyPath() {
        return path.join('assets', 'key.pem');
    }

    getSignaturePath() {
        return path.join('assets', 'signature.jpg');
    }
}

export const pathProvider = new PathProvider();
