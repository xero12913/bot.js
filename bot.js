client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  // السماح للإداريين فقط
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

  if (command === "حجر") {
    const choices = ["🪨 حجر", "📄 ورقة", "✂️ مقص"];
    const result = choices[Math.floor(Math.random() * choices.length)];
    message.reply(`اختياري: ${result}`);
  }
});
