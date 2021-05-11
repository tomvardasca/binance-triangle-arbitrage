const { parentPort } = require("worker_threads");

const TelegramBot = require("node-telegram-bot-api");
const CONFIG = require("../../config/config");

const Sqlite = require("./Sqlite");

// replace the value below with the Telegram token you receive from @BotFather
const token = CONFIG.TELEGRAM.TOKEN;
const chatId = CONFIG.TELEGRAM.CHATID;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/exe ?(\d*)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  let limit = match[1];
  limit = parseInt(limit, 10);
  if (Number.isNaN(limit)) {
    limit = 10;
  }

  Sqlite.getExecutionsSumPerDay(limit)
    .then((resp) => bot.sendMessage(chatId, resp, { parse_mode: "Markdown" }))
    .catch((e) => bot.sendMessage(chatId, `🚨 *Error*: ${e}`, { parse_mode: "Markdown" }));
});

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp, { parse_mode: "Markdown" });
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  // bot.sendMessage(chatId, "Received your message");
});

const throttle = (func, limit) => {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

parentPort.on(
  "message",
  throttle((data) => {
    if (data.newMessage) {
      bot.sendMessage(chatId, data.newMessage, { parse_mode: "Markdown" });
    }
  }),
  100,
);

process.on("exit", (...err) => console.log("TelegramBotWorker.on exit", err));
process.on("uncaughtException", (...err) => console.log("TelegramBotWorker.on uncaughtException", err));
