const Constants = require('../data/constants');

exports.angryReact = (api, message) => {
        const words = message.body.toLowerCase().split(" ");

        // Angry react
        if ( ( words.some(word => word.match(/\blo[!$*lo l]*\b/gm)) || words.includes("lmao") || words.includes("idm"))) {
            console.log("Sending reaction...");
            api.setMessageReaction("😠", message.messageID);
        }
};
