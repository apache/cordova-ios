const path = require('path');
const fs = require('fs-extra');
const cp = require('child_process');
const plist = require('plist');

const PROVISIONING_DIR = path.resolve(process.env['HOME'], 'Library/MobileDevice/Provisioning Profiles');

module.exports.readProvisioningsPromise = readProvisioningsPromise;
module.exports.mapPromise = mapPromise;
module.exports.forEachPromise = mapPromise; // Syntax Sugar
module.exports.convertPem = convertPem;
module.exports.getCertTextPromise = getCertTextPromise;
module.exports.findValidCertificatePromise = findValidCertificatePromise;
module.exports.getFingerprintPromise = getFingerprintPromise;
module.exports.findPluggedDevicesPromise = findPluggedDevicesPromise;
module.exports.getExpirationDateInMilli = getExpirationDateInMilli;
module.exports.findValidProvisioingsPromise = findValidProvisioingsPromise;

function readProvisioningsPromise (dir = PROVISIONING_DIR) {
    return readProvisioningDirPromise(dir)
        .then((files) => {
            return mapPromise(files, getRawProvisioningPromise, true);
        }).then((list) => {
            if (!list) {
                return [];
            }
            return list.map(extractProvisioning);
        });
}

function readProvisioningDirPromise (dir = PROVISIONING_DIR) {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, files) => {
            if (err) throw err;
            const fileList = files.filter((file) => {
                const fullFilePath = path.resolve(dir, file);
                return fs.statSync(fullFilePath).isFile() && /.mobileprovision$/.test(file);
            }).map((file) => { return path.resolve(dir, file); });
            resolve(fileList);
        });
    });
}

function mapPromise (arr, funcPromise, skipErr = true) {
    const procs = arr.map((elem) => {
        return (results) => {
            return new Promise((resolve, reject) => {
                funcPromise(elem).then((result) => {
                    resolve(results.concat([result]));
                }, (err) => {
                    if (skipErr) {
                        resolve(results.concat([null]));
                        return;
                    }
                    reject(err);
                });
            });
        };
    });
    return procs.reduce((acc, elem) => { return acc.then(elem); }, Promise.resolve([]));
}

function getRawProvisioningPromise (fullFilePath) {
    return new Promise((resolve, reject) => {
        let text = '';
        const proc = cp.spawn('security', ['cms', '-D', '-i', fullFilePath]);
        proc.stderr.on('data', (err) => {
            throw err;
        });
        proc.stdout.on('data', (data) => {
            text += data.toString();
        });
        proc.on('close', (code) => {
            if (code === 0) {
                const json = plist.parse(text);
                resolve(json);
            } else {
                resolve(null);
            }
        });
    });
}

function extractProvisioning (json) {
    const teamId = json['TeamIdentifier'][0];
    const UUID = json['UUID'];
    const teamName = json['TeamName'];
    const name = json['AppIDName'];
    const appIdPrefix = json['ApplicationIdentifierPrefix'][0];
    const appId = json['Entitlements']['application-identifier'];
    const provisionedDevices = json['ProvisionedDevices'];
    const developerCertificates = json['DeveloperCertificates'];
    const expirationDate = json['ExpirationDate'];
    const creationDate = json['CreationDate'];
    const bundleId = (appId.indexOf(appIdPrefix + '.') === 0) ? appId.substr(appIdPrefix.length + 1) : appId;
    return {
        teamId: teamId,
        UUID: UUID,
        teamName: teamName,
        name: name,
        appIdPrefix: appIdPrefix,
        appId: appId,
        bundleId: bundleId,
        provisionedDevices: provisionedDevices,
        developerCertificates: developerCertificates,
        expirationDate: expirationDate,
        expirationDateMilli: Date.parse(expirationDate),
        creationDate: creationDate,
        creationDateMilli: Date.parse(creationDate)
    };
}

function convertPem (textOrBuffer) {
    const text = ((typeof textOrBuffer) === 'object' && (textOrBuffer instanceof Buffer)) ? textOrBuffer.toString('base64') : textOrBuffer;

    const list = Array.from(Array(Math.floor((text.length - 1) / 64) + 1), (v, k) => k).reduce(
        (acc, k) => { return acc.concat(text.substr(k * 64, 64)); }, []
    );
    list.unshift('-----BEGIN CERTIFICATE-----');
    list.push('-----END CERTIFICATE-----');
    return list.join('\n');
}

function getCertTextPromise (pem) {
    return (new Promise((resolve, reject) => {
        let text = '';
        const proc = cp.spawn('openssl', ['x509', '-text', '-noout']);
        proc.stderr.on('data', (err) => {
            throw err;
        });
        proc.stdout.on('data', (data) => {
            text += data.toString();
        });
        proc.on('close', (code) => {
            if (code === 0) {
                resolve(text);
            } else {
                resolve(null);
            }
        });
        proc.stdin.write(pem);
        proc.stdin.end();
    }));
}

function getExpirationDateInMilli (text) {
    return text.split('\n').map((line) => {
        return line.match(/^\s+Not After :\s*(\S.+)$/);
    }).filter((m) => m).map((m) => Date.parse(m[1])).find((m) => true);
}

function findValidCertificatePromise () {
    return new Promise((resolve, reject) => {
        let text = '';
        const proc = cp.spawn('security', ['find-identity', '-v', '-p', 'codesigning']);
        proc.stderr.on('data', (err) => {
            throw err;
        });
        proc.stdout.on('data', (data) => {
            text += data.toString();
        });
        proc.on('close', function (code) {
            if (code === 0) {
                resolve(text);
            } else {
                resolve(null);
            }
        });
    }).then((result) => {
        if (!result) {
            return [];
        }
        return result.split('\n').map((line) => {
            const m = line.match(/^\s+(?:\d+)\)\s([0-9A-F]+)\s"(.+)"/);
            if (m) {
                return { fingerprint: m[1], identity: m[2] };
            }
            return null;
        }).filter(x => (x != null));
    });
}

function getFingerprintPromise (pem) {
    return new Promise((resolve, reject) => {
        let text = '';
        const proc = cp.spawn('openssl', ['x509', '-fingerprint', '-sha1', '-inform', 'pem']);
        proc.stderr.on('data', (err) => {
            throw err;
        });
        proc.stdout.on('data', (data) => {
            text += data.toString();
        });
        proc.on('close', (code) => {
            if (code === 0) {
                resolve(text);
            } else {
                resolve(null);
            }
        });
        proc.stdin.write(pem);
        proc.stdin.end();
    }).then((result) => {
        if (!result) {
            return null;
        }
        const m = result.match(/^SHA1\sFingerprint=([0-9A-F:]+)\n/);
        if (m) {
            return m[1].split(':').join('');
        }
        return null;
    });
}

function findValidProvisioingsPromise () {
    return readProvisioningsPromise().then((provs) => {
        return findValidCertificatePromise().then((validCerts) => {
            return mapPromise(provs, (prov) => {
                const certs = prov.developerCertificates;
                return mapPromise(certs, (cert) => {
                    const pem = convertPem(cert);
                    return getFingerprintPromise(pem);
                }).then((fps) => {
                    return fps.some((fp) => {
                        return validCerts.map((validCert) => validCert.fingerprint).includes(fp);
                    });
                }).then((isValid) => {
                    return isValid ? prov : null;
                });
            }).then((provs) => {
                return provs.filter((prov) => prov);
            });
        });
    });
}

// find USB plugged iPhone and iPad devices by calling ios-deploy
function findPluggedDevicesPromise () {
    return new Promise((resolve, reject) => {
        let text = '';
        const proc = cp.spawn('ios-deploy', ['-c']);
        proc.stderr.on('data', (err) => {
            throw err;
        });
        proc.stdout.on('data', (data) => {
            text += data.toString();
        });
        proc.on('close', (code) => {
            if (code === 0) {
                resolve(text);
            } else {
                resolve(null);
            }
        });
    }).then((result) => {
        if (!result) {
            return null;
        }
        const lines = result.split('\n');
        const re = /Found\s([0-9A-Fa-f-]+)/;
        return lines.map((line) => {
            const m = line.match(re);
            if (m) {
                return m[1];
            }
            return null;
        }).filter((line) => line);
    });
}
