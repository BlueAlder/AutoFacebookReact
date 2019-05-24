const login = require("facebook-chat-api");
const vision = require("@google-cloud/vision");
const fs = require("fs");
require('dotenv').config();

// Creates a client
const client = new vision.ImageAnnotatorClient();

// Try log in with current app state otherwise use credentials
let appState = {};
try {
    appState = JSON.parse(fs.readFileSync('appstate.json', 'utf8'))
} catch (e) {
    console.error(e);
}

// If appState exists login with it
if(appState) {
    logInWithAppState(appState);
} else {
    logInWithCredentials();
}


function logInWithCredentials() {
    console.log("Loggin in with credentials from env variables...");
    login({email: process.env.FB_USER, password: process.env.FB_PASS}, (err, api) => {
        if(err) return console.error(err);

        // save app state
        console.log("Writing app state to file appstate.json")
        fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));

        startListeningForMessages(api);
    })
}

function logInWithAppState(appState) {
    console.log("Logging in with pre-existing appstate")
    login({appState: appState }, (err, api) => {
        if(err) {
            console.error(err);
            console.log("Trying to log in with credentials...");
            
            logInWithCredentials()
    
        } else {
            startListeningForMessages(api);
        }    
    })
}

function startListeningForMessages(api) {
    api.listen((err, message) => {
        console.log(message);
        const words = message.body.toLowerCase().split(" ");
        if ( (words.includes("lol") || words.includes("lmao")) && message.senderID === process.env.SPECIFIC_USER_ID) {
            console.log(message);
            console.log("sending reaction...")
            api.setMessageReaction("😠", message.messageID);
        }

        // Check for photo being sent
    })
}