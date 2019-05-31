const vision = require("@google-cloud/vision");
// Creates a client
const client = new vision.ImageAnnotatorClient();

exports.facialDescription =  (api, message) => {
    api.sendMessage("DING DING DING ANALYSIS BEGINNING, this only happens 5% of the time so count yourself lucky!")
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
