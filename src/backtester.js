const yahooFinance = require('yahoo-finance2').default;
const moment = require('moment');

module.exports.handler = async (event, context, callback) => {

  const body = JSON.parse(event.body);

  const tickers = body.tickers.split(',');

  if (tickers[0] === '') {
    return callback(null, {
      statusCode: 500,
      body: 'Deve haver pelo menos um ticker. Separe mais de um ticker por vírgula.',
    });
  }

  const percents = body.percents.split(',').map(x=>+x);

  if (percents[0] === '' || percents.reduce((a,b) => a + b) < 100) {
    return callback(null, {
      statusCode: 500,
      body: 'Deve haver pelo menos uma porcentagem. Separe mais de uma porcentagem por vírgula.',
    });
  }

  if (!body.totalWalletValue || body.totalWalletValue < 1000) {
    return callback(null, {
      statusCode: 500,
      body: 'Valor total da carteira inválido. O valor deve ser no mínimo 1000.',
    });
  }

  const values = percents.map(p => body.totalWalletValue * p / 100);

  const dates = body.purchaseDate.split(',').map(d => moment(body.purchaseDate, 'DD/MM/YYYY'));

  if (!dates.every(d => d.isValid())) {
    return callback(null, {
      statusCode: 500,
      body: 'Data inválida.',
    });
  }

  if (![dates.length, values.length, percents.length, tickers.length].every(l => l === dates.length)) {
    return callback(null, {
      statusCode: 500,
      body: 'Dados inseridos são inválidos. Todos as propriedades devem ter a mesma quantidade de parâmetros.',
    });
  }

  const promiseArray = [];
  const queryOptions = dates.map(d => ({ period1: d.format('YYYY-MM-DD')}));

  tickers.forEach((ticker, idx) => {
    promiseArray.push(getTickersAndPurchase(ticker, queryOptions[idx], values[idx]));
  });

  const response = await Promise.all(promiseArray);

  return callback(null, {
    statusCode: 200,
    body: JSON.stringify(response),
  });

}

function getTickersAndPurchase(ticker, queryOptions, value) {

  return new Promise((resolve, reject) => {

  yahooFinance.historical(ticker + '.SA', queryOptions).then(res => {

    const purchasedAmount = Math.floor(value / res[0].close);
    const purchaseValue = res[0].close * purchasedAmount

    const simulatedValues = res.map(r => {
      return {
        date: moment(r.date).format('DD-MM-YYYY'),
        [ticker]: r.close * purchasedAmount
      };
    });

    const response = {
      ticker: ticker,
      purchasedAmount: purchasedAmount,
      purchaseValue: purchaseValue.toFixed(2),
      simulatedValues,
    }

    resolve(response);

  }).catch(err => {
    resolve({
      message: 'Algo ocorreu com o servidor ou a ação não existe.',
      error: err
    })
  });

  })

}