const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const prefix = "-";

client.on("ready", () => {
  console.log(`تم تشغيل البوت: ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const command = message.content.slice(prefix.length);

  if (command === "روليت") {
    message.reply("🎰 جاري تشغيل الروليت...");
  }

  if (command === "كراسي") {
    message.reply("🪑 لعبة الكراسي بدأت!");
  }

  if (command === "مافيا") {
    message.reply("🕵️ تم بدء لعبة المافيا!");
  }
});

client.login("MTUzMDgxMjQ1NTY4NzgxOTQwNQ.GDBa5t.bTtfRZ1DqblS7bAyHtT8k7l_kB0MUF1ioCEU84");
