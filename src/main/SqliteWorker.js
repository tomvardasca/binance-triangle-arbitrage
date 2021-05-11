const { parentPort } = require("worker_threads");

const logger = require("./Loggers");

const sqlite3 = require("sqlite3").verbose();

let db;

function startDatabase() {
  db = new sqlite3.Database("./my-trades.db", (e) => {
    if (e) {
      logger.performance.error("Error opening Sqlite.", e);
    } else {
      db.exec(
        `pragma journal_mode = WAL;
                 pragma synchronous = normal;
                 pragma temp_store = memory;
                 pragma mmap_size = 30000000000;
                 pragma page_size = 32768;
                 pragma vacuum;
                 pragma optimize;
        `,
        (e) => {
          if (!e) {
            createTradeExecutionTable();
          }
        },
      );
    }
  });
  return db;
}

function createTradeExecutionTable() {
  db.run(`CREATE TABLE IF NOT EXISTS TRADE_EXECUTION 
                (
                    trade_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                    calculated_id TEXT NOT NULL,
                    age INTEGER NOT NULL,
                    expected_profit NUMERIC NOT NULL,
                    time_taken INTEGER NOT NULL,
                    AB_ticker TEXT NOT NULL,
                    AB_expected_conversion NUMERIC NOT NULL,
                    AB_observed_conversion NUMERIC NOT NULL,
                    AB_price_change NUMERIC NOT NULL,
                    BC_ticker TEXT NOT NULL,
                    BC_expected_conversion NUMERIC NOT NULL,
                    BC_observed_conversion NUMERIC NOT NULL,
                    BC_price_change NUMERIC NOT NULL,
                    CA_ticker TEXT NOT NULL,
                    CA_expected_conversion NUMERIC NOT NULL,
                    CA_observed_conversion NUMERIC NOT NULL,
                    CA_price_change NUMERIC NOT NULL,
                    symbol_A TEXT NOT NULL,
                    symbol_A_delta NUMERIC NOT NULL,
                    symbol_A_delta_percent NUMERIC NOT NULL,
                    symbol_B TEXT NOT NULL,
                    symbol_B_delta NUMERIC NOT NULL,
                    symbol_B_delta_percent NUMERIC NOT NULL,
                    symbol_C TEXT NOT NULL,
                    symbol_C_delta NUMERIC NOT NULL,
                    symbol_C_delta_percent NUMERIC NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
                )`);
}

function insertTradeExecution(
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
  if (!db) {
    db = startDatabase();
  }
  db.run(
    `INSERT INTO TRADE_EXECUTION(
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
    ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
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
  );
}

function getExecutionsSumPerDay(limit = 10) {
  return new Promise((resolve, reject) => {
    if (!db) {
      db = startDatabase();
    }

    db.all(
      `SELECT symbol_A as symbol, strftime('%d-%m-%Y',timestamp) as day, SUM(symbol_A_delta) amount, COUNT(1) as count, AVG(time_taken) as time FROM TRADE_EXECUTION GROUP BY symbol_A, strftime('%d-%m-%Y',timestamp) LIMIT ${limit};`,
      function (err, rows) {
        if (err) {
          return reject(err);
        }
        const msg = `*Symbol \| Day \| Amount \| Count \| Time*`;
        rows.forEach(function (row) {
          msg += `
        ${row.symbol} \| ${row.day} \| ${row.amount} \| ${row.count} \| ${row.time}
        `;
        });
        resolve(msg);
      },
    );
  });
}

parentPort.on("message", async (data) => {
  if (data.fn) {
    switch (data.fn) {
      case "startDatabase":
        startDatabase();
        return;
      case "insertTradeExecution":
        insertTradeExecution(...data.args);
        return;
      case "getExecutionsSumPerDay":
        const ret = await getExecutionsSumPerDay(...data.args);
        parentPort.postMessage({ fn: "getExecutionsSumPerDay", ret });
        return;
    }
  }
});

process.on("exit", (...err) => console.log("SqliteWorker.on exit", err));
process.on("uncaughtException", (...err) => console.log("SqliteWorker.on uncaughtException", err));
