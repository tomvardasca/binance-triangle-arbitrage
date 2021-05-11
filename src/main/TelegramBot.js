const { Worker, SHARE_ENV } = require("worker_threads");

//Create new worker
const worker = new Worker(__dirname + "/TelegramBotWorker.js", { env: SHARE_ENV });

worker.on("error", (error) => {
  console.log(error);
});

module.exports.sendTradeExecution = function sendTradeExecution(expected_profit, age, time_taken, symbol_A, symbol_A_delta, symbol_A_delta_percent) {
  worker.postMessage({
    newMessage: `⚡️ *New Execution:*
    Symbol: ${symbol_A}
    Exp. Profit: ${expected_profit}
    Age: ${age}
    Delta: ${symbol_A_delta}
    %: ${symbol_A_delta_percent}
    Time taken: ${time_taken}ms`,
  });
};

module.exports.sendPerformanceWarn = function sendPerformanceWarn(cpu) {
  worker.postMessage({
    newMessage: `⚠️ *Performance degraded*
    CPU at ${cpu}%`,
  });
};

module.exports.sendHello = function sendHello(msg) {
  worker.postMessage({
    newMessage: `🏁 Hello - _${msg}_`,
  });
};

module.exports.sendPerformanceLog = function sendPerformanceLog(msg) {
  worker.postMessage({
    newMessage: `🏇 Performance - _${msg}_`,
  });
};

module.exports.sendError = function sendError(e) {
  worker.postMessage({
    newMessage: `🚨 *Error*: ${e}`,
  });
};

worker.on("exit", (...err) => console.log("worker.on exit", err));
