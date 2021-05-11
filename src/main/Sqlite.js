const logger = require("./Loggers");
const Database = require("better-sqlite3");

let db;

function startDatabase() {
  db = new Database("./my-trades.db");
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = normal");
  db.pragma("temp_store = memory");
  db.pragma("mmap_size = 30000000000");
  db.pragma("page_size = 32768");
  db.pragma("vacuum");
  db.pragma("optimize");

  createTradeExecutionTable();

  return db;
}

module.exports.startDatabase = startDatabase;

function createTradeExecutionTable() {
  if (!db) {
    db = startDatabase();
  }
  const createTable = db.prepare(`CREATE TABLE IF NOT EXISTS TRADE_EXECUTION 
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
  createTable.run();
}

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
  if (!db) {
    db = startDatabase();
  }
  const stm = db.prepare(
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
  );

  stm.run(
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
};

module.exports.getExecutionsSumPerDay = function getExecutionsSumPerDay(limit = 10) {
  if (!db) {
    db = startDatabase();
  }

  stm = db.prepare(
    `SELECT symbol_A as symbol, strftime('%d-%m-%Y',timestamp) as day, SUM(symbol_A_delta) amount, COUNT(1) as count, AVG(time_taken) as time FROM TRADE_EXECUTION GROUP BY symbol_A, strftime('%d-%m-%Y',timestamp) LIMIT ?`,
  );

  const msg = `*Symbol \| Day \| Amount \| Count \| Time*`;
  stm.all(limit).forEach(function (row) {
    msg += `
        ${row.symbol} \| ${row.day} \| ${row.amount} \| ${row.count} \| ${row.time}
        `;
  });
  return msg;
};
