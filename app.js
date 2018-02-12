const restify = require('restify');
const builder = require('botbuilder');

//Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log("%s listening to %s", server.name, server.url);
});

//Creatr chat connector for communication with the Bot Framework Service
const connector = new builder.ChatConnector({appId: process.env.MICROSOFT_APP_ID, appPassword: process.env.MICROSOFT_APP_PASSWORD});
// console.log(connector); Listen for message from users
server.post('/api/messages', connector.listen());


//Create your bot with a funcion to recieve message from the user Create bot and default mesage handler
const bot = new builder.UniversalBot(connector, (session) => {
   session.send("voice 555+");
})
bot.dialog('/xxx', (session) => {
        const msg = new builder.Message(session).addAttachment({
                contentType : "application/vnd.microsoft.card.adaptive",
                content : {
                    type: "AdaptiveCard",
                    speak: "<s>Your  meeting about \"Adaptive Card design session\"<break strength='weak'/> " +
                            "is starting at 12:30pm</s><s>Do you want to snooze <break strength='weak'/> or d" +
                            "o you want to send a late notification to the attendees?</s>",
                    body: [
                        {
                            "type": "TextBlock",
                            "text": "Adaptive Card design session",
                            "size": "large",
                            "weight": "bolder"
                        }, {
                            "type": "TextBlock",
                            "text": "Conf Room 112/3377 (10)"
                        }, {
                            "type": "TextBlock",
                            "text": "12:30 PM - 1:30 PM"
                        }, {
                            "type": "TextBlock",
                            "text": "Snooze for"
                        }, {
                            "type": "Input.ChoiceSet",
                            "id": "snooze",
                            "style": "compact",
                            "choices": [
                                {
                                    "title": "5 minutes",
                                    "value": "5",
                                    "isSelected": true
                                }, {
                                    "title": "15 minutes",
                                    "value": "15"
                                }, {
                                    "title": "30 minutes",
                                    "value": "30"
                                }
                            ]
                        }
                    ],
                    "actions": [
                        {
                            "type": "Action.OpenUrl",
                            "method": "POST",
                            "url": "http://foo.com",
                            "title": "Snooze"
                        }, {
                            "type": "Action.OpenUrl",
                            "method": "POST",
                            "url": "http://foo.com",
                            "title": "I'll be late"
                        }, {
                            "type": "Action.OpenUrl",
                            "method": "POST",
                            "url": "http://foo.com",
                            "title": "Dismiss"
                        }
                    ]
                }
            })
     session.send(msg).endDialog();
}).triggerAction({ matches:/^(show|list)/i });
 
