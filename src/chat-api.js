const login = require("facebook-chat-api");
const fs = require("fs");
const Listener = require("./listener");


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


logInWithCredentials =  () => {
    console.log("Logging in with credentials from env variables...");
    login({email: process.env.FB_USER, password: process.env.FB_PASS}, (err, api) => {
        if(err) {
            throw err;
        }
        console.log("Successfully logged in!");

        // save app state
        console.log("Writing app state to file appstate.json");
        fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));

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
