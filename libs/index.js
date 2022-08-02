const {credential} = require('firebase-admin');
const {initializeApp} = require('firebase-admin/app');
const {getStorage} = require('firebase-admin/storage');
const uuid = require('uuid');

module.exports = {
    init(config) {
        initializeApp({
            credential: credential.cert(config.serviceAccount),
            storageBucket: config.storageBucket,
            ...config.options,
        });

        const storage = getStorage().bucket(config.customBucket);

        const upload = (file, customParams = {}) =>
            new Promise((resolve, reject) => {
                const path = file.path ? `${file.path}/` : '';
                const filename = `${path}${file.name}`;
                const token = uuid.v4();

                storage.file(filename).save(
                    Buffer.from(file.buffer, 'binary'),
                    {
                        public: true,
                        contentType: file.mime,
                        metadata: {
                            metadata: {
                                firebaseStorageDownloadTokens: token,
                            },
                        },
                        ...customParams,
                    },
                    (err) => {
                        if (err) {
                            return reject(err);
                        }

                        file.url = `https://storage.googleapis.com/${config.storageBucket}/${filename}`;
                        resolve();
                    }
                );
            });

        return {
            upload: (file, customParams = {}) => upload(file, customParams),
            delete: (file, customParams = {}) =>
                new Promise((resolve, reject) => {
                    const path = file.path ? `${file.path}/` : '';
                    const filename = `${path}${file.name}`;

                    storage.file(filename).delete({...customParams}, (err) => {
                        if (err) {
                            reject(err);
                        }

                        resolve();
                    });
                }),
        };
    },
};
