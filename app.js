const restify = require('restify');
const builder = require('botbuilder');

//Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log("%s listening to %s", server.name, server.url);
});

//Creat chat connector for communication with the Bot Framework Service
constconnector = new builder.ChatConnector({appId: process.env.MICROSOFT_APP_ID, appPassword: process.env.MICROSOFT_APP_PASSWORD});
// console.log(connector); Listen for message from users
server.post('/api/messages', connector.listen());

// Create your bot with a function to receive messages from the user Create bot
// and default message handler
const bot = new builder.UniversalBot(connector, (session) =>{
    session.send("Hi... we sell shirts. Say 'show shirts' to see our products");
});

// Add dialog to return list of shirts available
bot.dialog('showShirts', (session)=> {
    const msg = new builder.Message(session);
    msg.attachmentLayout(builder.AttachmentLayout.carousel)
    msg.attachments([
        new builder.HeroCard(session)
            .title("Classic White T-Shirt")
            .subtitle("100% Soft and Luxurios Cotton")
            .text("Price is $25 and carried in sizes (S, M, L, and XL)")
            .images([builder.CardImage.create(session, 'http://petersapparel.parseapp.com/img/whiteshirt.png')])
            .buttons([
                builder.CardAction.imBack(session, "buy classic white t-shirt", "Buy")
            ]),
        new builder.HeroCard(session)
            .title("Classic Gray T-Shirt")
            .subtitle("100% Soft and Luxurious Cotton")
            .text("Price is $25 and carried in sizes (S, M, L, and XL)")
            .images([builder.CardImage.create(session, 'http://petersapparel.parseapp.com/img/grayshirt.png')])
            .buttons([
                builder.CardAction.imBack(session, "buy classic gray t-shirt", "Buy")
            ])
    ]);
    session.send(msg).endDialog();
}).triggerAction({ matches:/^(show|list)/i });

bot.dialog('buyButtonClick', [
    (session, args, next) => {
        const utterance = args.intent.matched[0];
        const color = /(white|gray)/i.exec(utterance);
        const size = /\b(Extra Large|Large|Medium|Small)\b/i.exec(utterance);
        if (color) {
            //Initialize cart item
            const item = session.dialogData.item = {
                product: "classic "+ color[0].toLowerCase() + "t-shirt",
                size: size ? size[0].toLowerCase() : null,
                price: 25.0,
                qty: 1
            };
            if (!item.size) {
                //Prompt for size
                builder.Prompts.choice(session, "What size would you like?","Small|Medium|Large|Extra");
            } else {
                //Skip to next waterfall step
                next();
            }
        } else {
            // Invalid produxt
            session.send("I'm sorry... That product wasn't found").endDialog();
        }
    },
    (session, results) => {
        //Save size if prompted
        const item = session.dialogData.item;
        if (results.response) {
            item.size = results.response.entity.toLowerCase()
        }

        //Add to cart
        if (!session.userData.cart) {
            session.userData.cart = [];
        }
        session.userData.cart.push(item);
        console.log('====================================');
        console.log(session.userData.cart);
        console.log('====================================');
        //Send confirmation to users
        session.send("A '%(size)s %(product)s' has been added to your cart,", item).endDialog();
    }
]).triggerAction({ matches: /(buy|add)\s.*shirt/i });

