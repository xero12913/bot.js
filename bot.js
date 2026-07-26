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

  if (!message.member.permissions.has("Administrator")) {
    return message.reply("❌ هذا الأمر للإداريين فقط.");
  }

  const command = message.content.slice(prefix.length).trim();

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

client.login(process.env.TOKEN);
