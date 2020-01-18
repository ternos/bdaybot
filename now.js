/**
 * This example demonstrates setting up webhook on Zeit Now platform.
 * Attention: You have to use webhook with Zeit Now only, polling doesn't
 * work.
 */


const TOKEN = process.env.TELEGRAM_TOKEN || '995867439:AAEnCnqZA1Y7GKelnuR8XFNW9smKWeUKGcE';
const TelegramBot = require('../..');
const options = {
  webHook: {
    // Just use 443 directly
    port: 443
  }
};
// You can use 'now alias <your deployment url> <custom url>' to assign fixed
// domain.
// See: https://zeit.co/blog/now-alias
// Or just use NOW_URL to get deployment url from env.
const url = 'YOUR_DOMAIN_ALIAS' || process.env.NOW_URL;
const bot = new TelegramBot(TOKEN, options);


// This informs the Telegram servers of the new webhook.
// Note: we do not need to pass in the cert, as it already provided
bot.setWebHook(`${url}/bot${TOKEN}`);


// Just to ping!
bot.on('message', function onMessage(msg) {
  bot.sendMessage(msg.chat.id, 'I am alive on Zeit Now!');
});

app.post("/start_bot", function(req, res) {
    const { message } = req.body;
    let reply = "Welcome to telegram weather bot";
    let city_check = message.text.toLowerCase().indexOf('/');
    if(message.text.toLowerCase().indexOf("hi") !== -1){
        sendMessage(telegram_url,message,reply,res);
    }else if( (message.text.toLowerCase().indexOf("check") !== -1) && (city_check !== -1 ) ){
        city = message.text.split('/')[1];
        get_forecast(city).then( response =>{
            post_forecast(telegram_url,response,message,res)
        });
    }else{
        reply = "request not understood, please review and try again.";
        sendMessage(telegram_url,message,reply,res);
        return res.end();`
    }
    });

    curl -F "url=https://bdaybot.now.sh/start" https://api.telegram.org/bot995867439:AAEnCnqZA1Y7GKelnuR8XFNW9smKWeUKGcE/setWebhook