const { Worker, SHARE_ENV } = require("worker_threads");

//Create new worker
const worker = new Worker(__dirname + "/SqliteWorker.js", { env: SHARE_ENV });

function startDatabase() {
  worker.postMessage({ fn: "startDatabase" });
}

module.exports.startDatabase = startDatabase;

module.exports.insertTradeExecution = function insertTradeExecution(
  calculated_id,
  age,
  expected_profit,
  time_taken,
  AB_ticker,
  AB_expected_conversion,
  AB_observed_conversion,
  AB_price_change,
  BC_ticker,
  BC_expected_conversion,
  BC_observed_conversion,
  BC_price_change,
  CA_ticker,
  CA_expected_conversion,
  CA_observed_conversion,
  CA_price_change,
  symbol_A,
  symbol_A_delta,
  symbol_A_delta_percent,
  symbol_B,
  symbol_B_delta,
  symbol_B_delta_percent,
  symbol_C,
  symbol_C_delta,
  symbol_C_delta_percent,
) {
  worker.postMessage({
    fn: "insertTradeExecution",
    args: [
      calculated_id,
      age,
      expected_profit,
      time_taken,
      AB_ticker,
      AB_expected_conversion,
      AB_observed_conversion,
      AB_price_change,
      BC_ticker,
      BC_expected_conversion,
      BC_observed_conversion,
      BC_price_change,
      CA_ticker,
      CA_expected_conversion,
      CA_observed_conversion,
      CA_price_change,
      symbol_A,
      symbol_A_delta,
      symbol_A_delta_percent,
      symbol_B,
      symbol_B_delta,
      symbol_B_delta_percent,
      symbol_C,
      symbol_C_delta,
      symbol_C_delta_percent,
    ],
  });
};

module.exports.getExecutionsSumPerDay = function getExecutionsSumPerDay(limit = 10) {
  return new Promise((resolve, reject) => {
    worker.once("message", ({ fn, ret }) => {
      if (fn === "getExecutionsSumPerDay") {
        resolve(ret);
      }
    });
    worker.postMessage({ fn: "getExecutionsSumPerDay", args: [limit] });
  });
};
