module.exports = {
  apps: [
    {
      name: 'rapier',
      script: 'npm run start',
      watch: true,
      env: {
        TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
        TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
      },
    },
  ],
};