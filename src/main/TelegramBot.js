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
    .then((resp) => bot.sendMessage(chatId, resp, { parse_mode: "HTML" }))
    .catch((e) => bot.sendMessage(chatId, `🚨 <b>Error</b>: ${e}`, { parse_mode: "HTML" }));
});

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp, { parse_mode: "HTML" });
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, "Received your message");
});

module.exports.sendTradeExecution = function sendTradeExecution(expected_profit, age, time_taken, symbol_A, symbol_A_delta, symbol_A_delta_percent) {
  bot.sendMessage(
    chatId,
    `⚡️ <b>New Execution:</b>
    Symbol: ${symbol_A}
    Exp. Profit: ${expected_profit}
    Age: ${age}
    Delta: ${symbol_A_delta}
    %: ${symbol_A_delta_percent}
    Time taken: ${time_taken}ms`,
    { parse_mode: "HTML" },
  );
};

module.exports.sendPerformanceWarn = function sendPerformanceWarn(cpu) {
  bot.sendMessage(
    chatId,
    `⚠️ <b>Performance degraded</b>
    CPU at ${cpu}%`,
    { parse_mode: "HTML" },
  );
};

module.exports.sendHello = function sendHello(msg) {
  bot.sendMessage(chatId, `🏁 Hello - <i>${msg}</i>`, { parse_mode: "HTML" });
};

module.exports.sendError = function sendError(e) {
  bot.sendMessage(chatId, `🚨 <b>Error</b>: ${e}`, { parse_mode: "HTML" });
};
