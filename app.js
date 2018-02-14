require('dotenv-extended').load();


const builder = require('botbuilder');
const needle = require('needle');
const restify = require('restify');
const url = require('url');
const validUrl = require('valid-url');
var predictionService = require('./prediction-service');

//****************************************************** */
//Bot setup
//****************************************************** */


//Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.port || 3978, ()  => {
    console.log('%s listen to $s', server.name, server.url);
});

//Create chat bot
const connector = new builder.ChatConnector({appId: "ceda1128-8477-4be4-8c9f-14681bb9acf1", appPassword: "ntikUWHO2836#@$jzcACH7)"});


server.post('/api/messages', connector.listen());

//Gets the TagName 
var bot = new builder.UniversalBot(connector, (session) => {
        if(hasImageAttachment(session)) {
                var stream = getImageStreamFromMessage(session.message);
        predictionService
            .getImageStremFromMessage(stream)
            .then(function (caption) { handleSuccessResponse(session, caption); })
            .catch(function (error) { handleErrorResponse(session, error); });
        }
})

//Greeting message
bot.on('conversationUpdate', (message) => {
            if(message.membersAdded) {
                message.membersAdded.forEach( (identity) => {
                    if (identity.id === message.address.bot.id) {
                        var reply = new builder.Message()
                            .address(message.address)
                            .text('Hi! I am PredictName Bot. If you want to know someone put image in this chatbox');
                        bot.send(reply);
                    }
                })
            }
})

//******************************************* */
//function
//******************************************* */
const hasImageAttachment = (session) => {
        return session.message.attachments.length > 0 && 
            session.message.attachments[0].contentType.indexOf('image') !== -1;
}

const getImageStreamFromMessage = (message) => {
        var headers = {};
        var attachment = message.attachments[0];

        headers['Content-Type'] = attachment.contentType;

        return needle.get(attachment.contentUrl, {headers: headers});
}

//******************************************* */
// Response Handling
//******************************************* */

const handleSuccessResponse = (session, caption) => {
    if (caption) {
        session.send('I think it\'s ' + caption);
    } else {
        session.send('Couldn\'t find a caption for this one');
    }

}

const handleErrorResponse = (session, error) => {
    var clientErrorMessage = 'Oops! Something went wrong. Try again later.';
    if (error.message && error.message.indexOf('Access denied') > -1) {
        clientErrorMessage += "\n" + error.message;
    }

    console.error(error);
    session.send(clientErrorMessage);
}
