const Constants = require("./constants");


const whitelisted_senders = [Constants.senderID["erol"], Constants.senderID["grace"]];
const whitelisted_threads = [Constants.threadID["bangme"]];

const whitelisted_sentiment_senders = [Constants.senderID["erol"], Constants.senderID["grace"]];
const whitelisted_sentiment_threads = [Constants.threadID["bangme"],
                                        Constants.threadID["ass"],
                                        Constants.threadID["gfBang"],
                                        Constants.threadID["BIT"],
                                        Constants.threadID["kiama"]];

const whitelisted_angry_senders = [Constants.senderID["grace"], Constants.senderID["sam"]];
const whitelisted_angry_threads = [];

exports.isWhitelisted = (senderID, threadID) => {
    return whitelisted_senders.includes(senderID) || whitelisted_threads.includes(threadID);
};

exports.isSentimentWhitelisted = (senderID, threadID) => {
    return whitelisted_sentiment_senders.includes(senderID) || whitelisted_sentiment_threads.includes(threadID);
};

exports.isAngryWhitelisted = (senderID, threadID) => {
    return whitelisted_angry_senders.includes(senderID) || whitelisted_angry_threads.includes(threadID);
};
