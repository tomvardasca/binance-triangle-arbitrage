const { Worker } = require("worker_threads");

//Create new worker
const worker = new Worker(__dirname + "/TelegramBotWorker.js");

worker.on("error", (error) => {
  console.log(error);
});

module.exports.sendTradeExecution = function sendTradeExecution(expected_profit, age, time_taken, symbol_A, symbol_A_delta, symbol_A_delta_percent) {
  worker.postMessage({
    newMessage: `⚡️ <b>New Execution:</b>
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
    newMessage: `⚠️ <b>Performance degraded</b>
    CPU at ${cpu}%`,
  });
};

module.exports.sendHello = function sendHello(msg) {
  worker.postMessage({
    newMessage: `🏁 Hello - <i>${msg}</i>`,
  });
};

module.exports.sendPerformanceLog = function sendPerformanceLog(msg) {
  worker.postMessage({
    newMessage: `🏇 Performance - <i>${msg}</i>`,
  });
};

module.exports.sendError = function sendError(e) {
  worker.postMessage({
    newMessage: `🚨 <b>Error</b>: ${e}`,
  });
};
