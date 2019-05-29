const login = require("facebook-chat-api");
const vision = require("@google-cloud/vision");
const fs = require("fs");
require('dotenv').config();

const senderID = {
    "erol": "100007595856517",
    "grace": "100005042073791",
    "sam": "1562842627"
}

const threadID = {
    "bangme": "1690680461173553"
}

const whitelisted_senders = [senderID["erol"], senderID["grace"]];
const whitelisted_threads = [threadID["bangme"]];

const probability = {
    "UNKNOWN": 0,
    "VERY_UNLIKELY": 1,
    "UNLIKELY": 2,
    "POSSIBLE": 3,
    "LIKELY": 4,
    "VERY_LIKELY": 5
}

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
console.log(appState)

if(!appState.key) {
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
    api.setOptions({
        logLevel: "warn",
        selfListen: true
    })

    api.listen((err, message) => {
        console.log(message);
        const words = message.body.toLowerCase().split(" ");
        words.forEach(word => console.log(word.match('/\blol[!?*lo]*\b')));
        

        if ( (words.some(word => word.match('/\blol[!?*lo]*\b') !== null) || words.includes("lmao") || words.includes("idm")) && message.senderID === process.env.SPECIFIC_USER_ID) {
            console.log(message);
            console.log("sending reaction...")
            api.setMessageReaction("😠", message.messageID);
        }

        // Check for photo being sent this only happens 5% of the time
        if ( message.attachments.length != 0 &&    
              ( (Math.random() * 100 < 5) && (whitelisted_senders.includes(message.senderID) || whitelisted_threads.includes(message.threadID)) ) ||
              message.body === "!analyse me" 
            ) {
            api.sendMessage("DING DING DING ANALYSIS BEGGINING, this only happens 5% of the time so count yourself lucky!")
            message.attachments.forEach(async (attachment) => {
                if (attachment.type === "photo") {
                    // api.sendMessage("ZING ZING analysing ya photo that you sent", message.threadID);
                    
                    const [faceResult] = await client.faceDetection(attachment.url);
                    const faces = faceResult.faceAnnotations;
                    console.log("Faces:");
                    console.log(faces);
                    

                    const [labelResult] = await client.labelDetection(attachment.url);
                    const labels = labelResult.labelAnnotations;
                    console.log("Labels:");
                    console.log(labels);

                    let message_to_send = "";
                    if (faces.length == 1) {
                        api.sendMessage("Wow just you in the photo looking pretty snazy huh?", message.threadID);
                    } else if (faces.length > 1) {
                        api.sendMessage(`That's kinda cool I like how there is ${faces.length} of you in the photo.`, message.threadID);
                    }
                    
                    // api.sendMessage("FACIAL ANALYSIS BEGINNING", message.threadID);
                    faces.forEach((face, index) => {
                        message_to_send +=  `Hmm looking at face ${index + 1}, i reckon you look `
                        if (probability[face.joyLikelihood] >= probability["POSSIBLE"]) {
                            message_to_send += "happy, "
                        }

                        if (probability[face.angerLikelihood] >= probability["POSSIBLE"]) {
                            message_to_send += "angery, "
                        }

                        if (probability[face.sorrowLikelihood] >= probability["POSSIBLE"]) {
                            message_to_send += "sad :(, "
                        }

                        if (probability[face.surpriseLikelihood] >= probability["POSSIBLE"]) {
                            message_to_send += "SURPRISED, "
                        }
                    });
                    message_to_send += " and of course just living life ya know?"
                    api.sendMessage(message_to_send, message.threadID);

                    api.sendMessage("hey do you know what i really like about that photo you sent :)", message.threadID);
                
                    api.sendMessage(`I really like how this photo tipifys the meaning of ${labels[0].description}`, message.threadID)
                    api.sendMessage(`I also like how its kinda ${labels[1].description}y hehe`, message.threadID)
                    api.sendMessage(`but most of it defintely looks like a great ${labels[2].description}`, message.threadID)

                }
            });
        }
    })
}
