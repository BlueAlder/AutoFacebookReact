const Constants = require("./data/constants");
const React = require("./messages/react");
const PhotoAnalysis = require("./messages/photo");
const Language = require("./messages/language");
const Whitelist = require("./data/whitelist");

exports.startListeningForMessages = (api) => {
    api.setOptions({
        logLevel: "http",
        // selfListen: true
    });

    api.listen( async (err, message) => {
        console.log(message);
        
        // Save message to db with sentiment
        if (Whitelist.isSentimentWhitelisted(message.senderID, message.threadID) && message.body.length !== 0) {
            Language.saveSentiment(message);
        }

        if (Whitelist.isAngryWhitelisted(message.senderID, message.threadID)) {
            React.angryReact(api, message)
        }

        // Check for photo being sent this only happens 5% of the time

        if ( message.attachments.length !== 0 &&  Whitelist.isPhotoWhitelisted(message.senderID, message.threadID) ) {
            console.log("Message was sent RNG'ing...");
            const RNG = Math.random() * 100;
            console.log(`RNG was ${RNG}`);
            if ( RNG < 5 ) {
                PhotoAnalysis.facialDescription(api, message)
            }
        }
    })
};
