const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder
} = require("discord.js");

let roulettePlayers = [];
let rouletteRunning = false;


client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "-روليت") {

    if (!message.member.permissions.has("Administrator")) {
      return message.reply("❌ للأداريين فقط");
    }

    if (rouletteRunning) {
      return message.reply("🎰 يوجد روليت شغالة حاليا");
    }

    roulettePlayers = [];
    rouletteRunning = true;


    const joinButton = new ButtonBuilder()
      .setCustomId("roulette_join")
      .setLabel("🎰 دخول عشوائي")
      .setStyle(ButtonStyle.Success);


    const leaveButton = new ButtonBuilder()
      .setCustomId("roulette_leave")
      .setLabel("🚪 انسحاب")
      .setStyle(ButtonStyle.Danger);


    const row = new ActionRowBuilder()
      .addComponents(joinButton, leaveButton);


    await message.channel.send({
      content:
        "🎰 **روليت Xero**\n\n" +
        "🟢 دخول للمشاركة\n" +
        "🔴 انسحاب للخروج\n\n" +
        "⏳ البداية بعد 80 ثانية\n" +
        "👥 الحد الأقصى: 20 لاعب",
      components: [row]
    });


    setTimeout(() => {

      if (roulettePlayers.length < 2) {
        rouletteRunning = false;
        return message.channel.send("❌ عدد اللاعبين غير كافي");
      }

      startRoulette(message.channel);

    }, 80000);
  }
});


async function startRoulette(channel) {

  await channel.send(
    `🎰 بدأت الروليت بـ ${roulettePlayers.length} لاعبين`
  );


  while (roulettePlayers.length > 1) {

    let chooser =
      roulettePlayers[
        Math.floor(Math.random() * roulettePlayers.length)
      ];


    let options = roulettePlayers
      .filter(p => p.id !== chooser.id)
      .map(p => ({
        label: p.username.slice(0, 25),
        value: p.id
      }));


    const menu = new StringSelectMenuBuilder()
      .setCustomId("roulette_kick")
      .setPlaceholder("اختر لاعب لطرده")
      .addOptions(options);


    const row = new ActionRowBuilder()
      .addComponents(menu);


    const msg = await channel.send({
      content:
        `🎯 دور ${chooser}\n` +
        "⏳ لديك 15 ثانية لاختيار لاعب",
      components: [row]
    });


    let kicked = false;


    const collector = msg.createMessageComponentCollector({
      time: 15000
    });


    collector.on("collect", async interaction => {

      if (interaction.user.id !== chooser.id) {
        return interaction.reply({
          content: "❌ ليس دورك",
          ephemeral: true
        });
      }


      const target = roulettePlayers.find(
        p => p.id === interaction.values[0]
      );


      roulettePlayers = roulettePlayers.filter(
        p => p.id !== target.id
      );


      kicked = true;


      await interaction.update({
        content:
          `❌ تم إخراج ${target}\n` +
          `👥 المتبقي: ${roulettePlayers.length}`,
        components: []
      });


      collector.stop();

    });


    await new Promise(resolve => {
      collector.on("end", resolve);
    });


    if (!kicked) {

      roulettePlayers = roulettePlayers.filter(
        p => p.id !== chooser.id
      );


      await channel.send(
        `⏰ ${chooser} لم يختار أحد وتم إخراجه`
      );
    }
  }


  await channel.send(
    `🏆 الفائز في الروليت: ${roulettePlayers[0]}`
  );


  roulettePlayers = [];
  rouletteRunning = false;
}



client.on("interactionCreate", async interaction => {

  if (!interaction.isButton()) return;


  if (interaction.customId === "roulette_join") {

    if (!rouletteRunning) {
      return interaction.reply({
        content: "❌ لا توجد روليت حاليا",
        ephemeral: true
      });
    }


    if (roulettePlayers.length >= 20) {
      return interaction.reply({
        content: "❌ الروليت ممتلئة",
        ephemeral: true
      });
    }


    if (roulettePlayers.includes(interaction.user)) {
      return interaction.reply({
        content: "⚠️ أنت داخل بالفعل",
        ephemeral: true
      });
    }


    roulettePlayers.push(interaction.user);


    return interaction.reply({
      content: "✅ دخلت الروليت 🎰",
      ephemeral: true
    });
  }


  if (interaction.customId === "roulette_leave") {


    roulettePlayers = roulettePlayers.filter(
      p => p.id !== interaction.user.id
    );


    return interaction.reply({
      content: "🚪 انسحبت من الروليت",
      ephemeral: true
    });
  }

});
