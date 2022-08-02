# @purwasadr/strapi-provider-upload-firebase-storage

## Installation
```bash
# using yarn
yarn add @purwasadr/strapi-provider-upload-firebase-storage

# using npm
npm install @purwasadr/strapi-provider-upload-firebase-storage
```

## Configuration

- `provider` defines the name of the provider
- `providerOptions` is passed down during the construction of the provider.
- `actionOptions` is passed directly to the parameters to each method respectively. You can find the complete list of [upload options](https://googleapis.dev/nodejs/storage/latest/global.html#CreateWriteStreamOptions) and [delete options](https://googleapis.dev/nodejs/storage/latest/File.html#delete)

See the [documentation about using a provider](https://docs.strapi.io/developer-docs/latest/plugins/upload.html#using-a-provider) for information on installing and using a provider. To understand how environment variables are used in Strapi, please refer to the [documentation about environment variables](https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/optional/environment.html#environment-variables).

### Provider Configuration

`./config/plugins.js`

```js
module.exports = ({ env }) => ({
  // ...
  upload: {
    config: {
      provider: '@purwasadr/strapi-provider-upload-firebase-storage',
      providerOptions: {

        // Can be pathString or object
        serviceAccount: env('STORAGE_SERVICE_ACCOUNT'),  

        // Your bucket name. example : if the bucket URL displayed in the Firebase console 
        // is gs://bucket-name.appspot.com, pass the string bucket-name.appspot.com
        storageBucket: env('STORAGE_BUCKET_URL'),  

        // Use custom bucket if any
        customBucket: env('STORAGE_CUSTOM_BUCKET'),  
      },
      actionOptions: {

        // Upload options see : https://googleapis.dev/nodejs/storage/latest/global.html#CreateWriteStreamOptions
        upload: {},

        // Delete options see : https://googleapis.dev/nodejs/storage/latest/File.html#delete
        delete: {},
      },
    },
  },
  // ...
});
```

### Security Middleware Configuration

Due to the default settings in the Strapi Security Middleware you will need to modify the `contentSecurityPolicy` settings to properly see thumbnail previews in the Media Library. You should replace `strapi::security` string with the object bellow instead as explained in the [middleware configuration](https://docs.strapi.io/developer-docs/latest/setup-deployment-guides/configurations/required/middlewares.html#loading-order) documentation.

`./config/middlewares.js`

```js
module.exports = [
  // ...
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'storage.googleapis.com',
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'storage.googleapis.com',
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  // ...
];
```