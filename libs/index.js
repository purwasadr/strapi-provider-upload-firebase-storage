const { credential } = require('firebase-admin');
const { initializeApp } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');
const uuid = require('uuid');

module.exports = {
    init(config) {
        initializeApp({
            credential: credential.cert(config.serviceAccount),
            storageBucket: config.bucketUrl,
            ...config.options
        });

        const storageBucket = getStorage().bucket(config.customBucket);

        const upload = (file, customParams = {}) => new Promise((resolve, reject) => {
            const path = file.path ? `${file.path}/` : '';
            const filename = `${path}${file.name}`
            const token = uuid.v4();

            storageBucket.file(filename)
                .save(Buffer.from(file.buffer, "binary"), { 
                    public: true,
                    contentType: file.mime,
                    metadata: {
                        metadata: {
                            firebaseStorageDownloadTokens: token
                        }
                    },
                    ...config.uploadOptions,
                }, (err) => {
                    if (err) {
                        return reject(err);
                    }

                    file.url = createPersistentDownloadUrl(config.bucketUrl, filename, token);
                    resolve();
                })

        })

        return {
            upload: (file, customParams = {}) => upload(file, customParams),
            delete: (file, customParams = {}) => new Promise((resolve, reject) => {
                const path = file.path ? `${file.path}/` : '';
                const filename = `${path}${file.name}`

                storageBucket.file(filename).delete({ ...config.deleteOptions }, (err) => {
                    if (err) {
                        reject(err);
                    }

                    resolve();
                })
            })
        }
    }
}

const createPersistentDownloadUrl = (bucket, pathToFile, downloadToken) => {
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(
      pathToFile
    )}?alt=media&token=${downloadToken}`;
  };