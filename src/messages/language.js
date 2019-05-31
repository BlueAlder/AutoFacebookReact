// Connecting to DB
const { Pool } = require("pg");
const pool = new Pool();

// Imports the Google Cloud client library
const language = require('@google-cloud/language');

// Instantiates a client
const languageClient = new language.LanguageServiceClient();



exports.saveSentiment = async (message) => {
    const document = {
        content: message.body,
        type: 'PLAIN_TEXT',
      };
      
      // Detects the sentiment of the text
      languageClient
        .analyzeSentiment({document: document})
        .then(async (results) => {
          const sentiment = results[0].documentSentiment;
            
          const query = "INSERT INTO public.messages (mid, sender_id, thread_id, body, time_sent, is_group, sentiment_score, sentiment_magnitude) values ($1, $2, $3, $4, $5, $6, $7, $8)";
          const values = [message.messageID, message.senderID, message.threadID, message.body, parseInt(message.timestamp), message.isGroup, sentiment.score, sentiment.magnitude];
          const res = await pool.query(query, values);
        //   await pool.end();
        })
        .catch(err => {
          console.error('ERROR:', err);
        });
};
