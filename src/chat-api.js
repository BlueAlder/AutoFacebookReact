const login = require("facebook-chat-api");
// const fs = require("fs");
const Listener = require("./listener");
const Utils = require("./util")



exports.loginAndListen = async() => {

    // Try log in with current app state otherwise use credentials
    let appState = {};
    try {
        appState =  JSON.parse( await Utils.getSecret('fb-login-token'));
    } catch (e) {
        console.error(e);
    }

    if(appState.length) {
           logInWithAppState(appState) 
        
    } else {
        logInWithCredentials();
    }
};


logInWithCredentials = async  () => {
    console.log("Logging in with credentials from GCP secrets...");
    const FB_USER = await Utils.getSecret('facebook-user')
    const FB_PASS = await Utils.getSecret('facebook-pass')
    // console.log(FB_USER)
    // console.log(FB_PASS)
    // // exit(0)

    login({email: FB_USER, password: FB_PASS}, async (err, api) => {
        if(err) {
            throw err;
        }
        console.log("Successfully logged in!");

        // save app state
        console.log("Writing app state to secret manager");
        await Utils.updateSecret('fb-login-token', JSON.stringify(api.getAppState()));

        Listener.startListeningForMessages(api);
    })
};

logInWithAppState = async (appState) => {
    console.log("Logging in with pre-existing appstate");
    await login({appState: appState }, (err, api) => {
        if(err) {
            console.log('poop')
            console.error(err);

            console.log("Appstate log in failed, attempting log in with credentials...");
            logInWithCredentials()            
    
        } else {
            console.log("Successfully logged in!");
            Listener.startListeningForMessages(api);
        }    
    })
};

