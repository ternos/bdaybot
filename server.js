require('dotenv').config();

const   express = require('express'),
        TelegramBot = require('node-telegram-bot-api'),
        Airtable = require('airtable'),
        CronJob = require('cron').CronJob,
        app = express(),
        port = 8000

const   token = process.env.TELEGRAMTOKEN,
        bot = new TelegramBot(token, {polling: true}),
        base = new Airtable({apiKey: process.env.AIRAPIKEY}).base(process.env.AIRBASEID);

bot.onText(/\/start/, (msg) => {

  base('Search').select({
    view: "Grid view"
  }).eachPage(function page(records, fetchNextPage) {
    let idStr = msg.chat.id.toString()

    records.forEach(record => {
      let sendersArr = record.get('senders')
      
      if(msg.chat.username !== record.get('account')) { // проверка на то, что это строка про автора чата
        if(sendersArr === undefined) {                  // проверка, что в чате 0 отправителей
              updateSenderList(record.id, idStr)
          } else {              
              let idStrPosition = sendersArr.indexOf(idStr)
              if (idStrPosition < 0) {
                sendersArr.push(idStr) 
                updateSenderList(record.id, sendersArr)
              }
          }
      }
    });
    fetchNextPage();
    bot.sendMessage(msg.chat.id, 'Напиши /next, чтобы узнать, когда ближайший праздник.')
  }, function done(err) {
    if (err) { console.error(err); return; }
});
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  console.log('\x1b[33m%s\x1b[0m', msg.from.username, msg.text)


  // список всех дней рождения
  if(msg.text === '/next') {
    getNearestBday()
  }

  // Консоль в чате телеграмма с ботом
  if(msg.chat.id === 1642712) {
    if(msg.text.substring(0, 5) === '/run ') {
      return eval(msg.text.substring(5))
    }
  }
});

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
})


// new CronJob('* * * * * *', function() {
//     const d = new Date();
//     console.log('Every Tenth Minute:', d);
// }, null, true, 'Europe/Moscow');


bot.on('callback_query', function onCallbackQuery(callbackQuery) {
  const rowId = callbackQuery.data;
  const msg = callbackQuery.message;
  const opts = {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
  };

  if(callbackQuery.data.substring(0,4) === 'http') {
      bot.sendMessage(msg.chat.id, callbackQuery.data)
  } else if (callbackQuery.data.substring(0,1) === '@') {
      bot.sendMessage(msg.chat.id, `Напиши, пожалуйста, ${rowId}. Там вся секретная информация.`)
  } else {
    base('Search').find(rowId, function(err, record) {
        if (err) { console.error(err); return; }
        let sendersArr = record.fields.senders
        let idStr = msg.chat.id.toString()
        let idStrPosition = sendersArr.indexOf(idStr)

        if (idStrPosition >= 0) {
          sendersArr.splice(idStrPosition, 1)
        }

        updateSenderList(rowId, sendersArr)

      })
    
    bot.sendMessage(msg.chat.id, 'Напоминания отключены');
  }
});

// обновление списка рассылки
updateSenderList = (rowId, senderArrayId) => {
  base('Search').update([
    {
      "id": rowId,
      "fields": {
        "senders": senderArrayId
      }
    }
  ], {typecast: true}, function(err, records) {
      if (err) { console.error(err);
        return;
      }
    });
}

// Поиск ближайших событий
getNearestBday = () => {
  base('Search').select({
    view: "Grid view"
}).eachPage(function page(records, fetchNextPage) {
    records.forEach(function(record) {
        if(record.get('DaysTo') < 30) {
          sendInviteToBday(record, record.get('senders'))
        }
    });
    fetchNextPage();
}, function done(err) {
    if (err) { console.error(err); return; }
});
}

// Рассылка приглашений на др
sendInviteToBday = (record, sendersArr) => {
  let options = {
    parse_mode: "HTML",
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: 'Хочу принять участие', callback_data: record.get('groupLink') }],
        [{ text: 'Не напоминать об этом', callback_data: record.getId() }]
      ]
    })
  };

  if(sendersArr !== undefined) {
    sendersArr.forEach(person => {
      bot.sendMessage(person, `Йу-хуу! Через ${record.get('DaysTo')} дней мы празднуем день рождение @${record.get('account')}.\nЕсли хочешь поздравить — Присоединяйся!`,
      options);
  })
  }
}