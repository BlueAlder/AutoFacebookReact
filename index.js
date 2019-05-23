const login = require("facebook-chat-api");
const fs = require("fs");
require('dotenv').config();


login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
    if(err) return console.error(err);

    // fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));

    api.listen((err, message) => {

        if (message.body.toLowerCase().split(" ").includes("lol")) {
            console.log(message);
            console.log("sending reaction...")
            api.setMessageReaction("😠", message.messageID);
        }

    })
})