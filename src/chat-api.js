const login = require("facebook-chat-api");
const fs = require("fs");
const Listener = require("./listener");

const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const { exit } = require("process");
const client = new SecretManagerServiceClient();


exports.loginAndListen = () => {

    // Try log in with current app state otherwise use credentials
    let appState = {};
    try {
        appState = JSON.parse(fs.readFileSync('appstate.json', 'utf8'))
    } catch (e) {
        console.error(e);
    }

    if(appState.length) {
        try {
            logInWithAppState(appState);
        } catch (e) {
            console.log("Appstate log in failed, attempting log in with credentials...");
            logInWithCredentials();
        }
        
    } else {
        logInWithCredentials();
    }
};


logInWithCredentials = async  () => {
    console.log("Logging in with credentials from env variables...");
    const FB_USER = await getSecret('facebook-user')
    const FB_PASS = await getSecret('facebook-pass')
    console.log(FB_USER)
    console.log(FB_PASS)
    // exit(0)

    login({email: FB_USER, password: FB_PASS}, async (err, api) => {
        if(err) {
            throw err;
        }
        console.log("Successfully logged in!");

        // save app state
        console.log("Writing app state to file appstate.json");
        await updateSecret('fb-login-token', JSON.stringify(api.getAppState()));

        Listener.startListeningForMessages(api);
    })
};

logInWithAppState = (appState) => {
    console.log("Logging in with pre-existing appstate");
    login({appState: appState }, (err, api) => {
        if(err) {
            console.error(err);
            throw err;            
    
        } else {
            console.log("Successfully logged in!");
            Listener.startListeningForMessages(api);
        }    
    })
};

async function getSecret(secretName) {
    const [secret] = await client.accessSecretVersion(
        {name: `projects/${process.env.PROJECT_ID}/secrets/${secretName}/versions/latest`}
    )
    return secret.payload.data.toString();
}

async function updateSecret(secretName, secretValue) {
    const payload = Buffer.from(secretValue, 'utf8');
    const [version] = await client.addSecretVersion({
        parent: `projects/${process.env.PROJECT_ID}/secrets/${secretName}`,
        payload: {
          data: payload,
        },
      });
    return version;
}
