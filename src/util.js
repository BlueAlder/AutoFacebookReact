const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();


exports.getSecret = async (secretName) => {
    const [secret] = await client.accessSecretVersion(
        {name: `projects/${process.env.PROJECT_ID}/secrets/${secretName}/versions/latest`}
    )
    // console.log(secret.payload.data.toString())
    return secret.payload.data.toString();
}

exports.updateSecret = async (secretName, secretValue) => {
    const payload = Buffer.from(secretValue, 'utf8');
    const [version] = await client.addSecretVersion({
        parent: `projects/${process.env.PROJECT_ID}/secrets/${secretName}`,
        payload: {
          data: payload,
        },
      });
    return version;
}