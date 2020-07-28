const Constants = require("./data/constants");
const React = require("./messages/react");
const Weather = require("./messages/weather")
const PhotoAnalysis = require("./messages/photo");
// const Language = require("./messages/language");
const Whitelist = require("./data/whitelist");

exports.startListeningForMessages = (api) => {
    api.setOptions({
        logLevel: "http",
        listenEvents: true,
        selfListen: true,
    });

    api.listenMqtt( (err, event) => {
        if(err) return console.error(err);

        switch(event.type) {
            case "message":
                // console.log(event)

                // Check for angry react
                if (Whitelist.isAngryWhitelisted(event.senderID, event.threadID)) {
                    React.angryReact(api, event)
                }

                //Check for weather keyword
                const keyWord = event.body.toLowerCase().split(" ")[0];

                if (keyWord === "!weather") {
                    Weather.weatherCheck(api, event);
                }




                break;
            case "event":
                console.log(event)
                break;
        }
        
        // console.log(message);
        
        // Save message to db with sentiment
        // if (Whitelist.isSentimentWhitelisted(message.senderID, message.threadID) && message.body.length !== 0) {
        //     Language.saveSentiment(message);
        // }

        

        // Check for photo being sent this only happens 5% of the time

        // if ( message.attachments.length !== 0 &&  Whitelist.isPhotoWhitelisted(message.senderID, message.threadID) ) {
        //     console.log("Message was sent RNG'ing...");
        //     const RNG = Math.random() * 100;
        //     console.log(`RNG was ${RNG}`);
        //     if ( RNG < 5 ) {
        //         PhotoAnalysis.facialDescription(api, message)
        //     }
        // }
    })
};
