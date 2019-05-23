const login = require("facebook-chat-api");
require('dotenv').config();


login({email: process.env.FB_USER, password: process.env.FB_PASS}, (err, api) => {
    if(err) return console.error(err);

    api.listen((err, message) => {

        if (message.body.toLowerCase() == "lol") {
            console.log(message);
            console.log("sending reaction...")
            api.setMessageReaction("😠", message.messageID);
        }
    })
})