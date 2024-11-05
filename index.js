const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

const bot = new TelegramBot(token);

async function getPrices() {
  try {
    const response = await axios.get('https://api.binance.com/api/v3/ticker/price');
    return response.data.reduce((acc, item) => {
      if (item.symbol.endsWith('USDT')) {
        acc[item.symbol] = parseFloat(item.price);
      }
      return acc;
    }, {});
  } catch (error) {
    console.error('Error fetching prices:', error);
    return {};
  }
}

function calculateGainers(pricesOld, pricesNew) {
  const gains = {};
  for (const symbol in pricesOld) {
    if (pricesNew[symbol]) {
      const oldPrice = pricesOld[symbol];
      const newPrice = pricesNew[symbol];
      const gain = ((newPrice - oldPrice) / oldPrice) * 100;
      gains[symbol] = gain;
    }
  }
  return Object.entries(gains).sort((a, b) => b[1] - a[1]);
}

function sendTelegramMessage(message) {
  bot.sendMessage(chatId, message)
    .then(() => console.log('Message sent to Telegram'))
    .catch(error => console.error('Error sending message:', error));
}

function getCurrentTime() {
  return new Date().toLocaleString();
}


async function monitorPrices() {
  console.log('Fetching initial prices...');
  const prices10MinAgo = await getPrices();

  setTimeout(async () => {
    console.log('Fetching current prices...');
    const currentPrices = await getPrices();
    const topGainers = calculateGainers(prices10MinAgo, currentPrices);

    const message = `Top gainers in the last 5 minutes (as of ${getCurrentTime()}):\n` +
      topGainers.slice(0, 30).map(([symbol, gain]) => `${symbol}: ${gain.toFixed(2)}%`).join('\n');


    console.log(message);
    sendTelegramMessage(message);
  }, 5 * 60 * 1000); // 600,000 ms = 10 minutes
}

setInterval(monitorPrices, 5 * 60 * 1000); // Run every 10 minutes
monitorPrices();