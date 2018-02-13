const restify = require('restify');
const builder = require('botbuilder');

//Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log("%s listening to %s", server.name, server.url);
});

//Creat chat connector for communication with the Bot Framework Service
const connector = new builder.ChatConnector({appId: process.env.MICROSOFT_APP_ID, appPassword: process.env.MICROSOFT_APP_PASSWORD});
// console.log(connector); Listen for message from users
server.post('/api/messages', connector.listen());


// Create your bot with a function to receive messages from the user
const bot = new builder.UniversalBot(connector,  (session) => {
    const msg = session.message;
    if (msg.attachments && msg.attachments.length > 0) {
        // Echo back attachment
        const attachment = msg.attachments[0];
        session.send({
            text: "You sent:",
            attachments: [
                {
                    contentType: attachment.contentType,
                    contentUrl: attachment.contentUrl,
                    name: attachment.name
                }
            ]
        });
    } else {
        // Echo back users text
        session.send("You said: %s", session.message.text);
    }
});

