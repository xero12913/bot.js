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
      return message.reply("🎰 يوجد روليت شغالة");
    }

    roulettePlayers = [];
    rouletteRunning = true;


    const join = new ButtonBuilder()
      .setCustomId("roulette_join")
      .setLabel("🎰 دخول عشوائي")
      .setStyle(ButtonStyle.Success);


    const leave = new ButtonBuilder()
      .setCustomId("roulette_leave")
      .setLabel("🚪 انسحاب")
      .setStyle(ButtonStyle.Danger);


    const row = new ActionRowBuilder()
      .addComponents(join, leave);


    await message.channel.send({
      content:
      "🎰 **روليت Xero**\n\n" +
      "🟢 اضغط دخول للمشاركة\n" +
      "🔴 اضغط انسحاب للخروج\n\n" +
      "⏳ البداية بعد 80 ثانية\n" +
      "👥 الحد الأقصى 20 لاعب",
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

  channel.send(
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
        label: p.username.slice(0,25),
        value: p.id
      }));


    const menu = new StringSelectMenuBuilder()
      .setCustomId("kick_player")
      .setPlaceholder("اختر لاعب لطرده")
      .addOptions(options);


    const row = new ActionRowBuilder()
      .addComponents(menu);


    let msg = await channel.send({
      content:
      `🎯 دور ${chooser}\n` +
      "⏳ لديك 15 ثانية لطرد لاعب",
      components:[row]
    });


    let kicked = false;


    const collector =
    msg.createMessageComponentCollector({
      time:15000
    });


    collector.on("collect", async interaction => {

      if (interaction.user.id !== chooser.id)
        return interaction.reply({
          content:"❌ ليس دورك",
          ephemeral:true
        });


      let target =
      roulettePlayers.find(
        p => p.id === interaction.values[0]
      );


      roulettePlayers =
      roulettePlayers.filter(
        p => p.id !== target.id
      );


      kicked = true;

      await interaction.update({
        content:
        `❌ ${target} خرج من الروليت\n`+
        `👥 المتبقي: ${roulettePlayers.length}`,
        components:[]
      });

      collector.stop();

    });



    await new Promise(resolve => {
      collector.on("end", resolve);
    });


    if (!kicked) {

      roulettePlayers =
      roulettePlayers.filter(
        p => p.id !== chooser.id
      );


      await channel.send(
        `⏰ ${chooser} لم يختر أحد وتم إخراجه`
      );
    }


    await new Promise(r => setTimeout(r,1000));
  }


  channel.send(
    `🏆 الفائز في الروليت: ${roulettePlayers[0]}`
  );


  roulettePlayers = [];
  rouletteRunning = false;
}



client.on("interactionCreate", async interaction => {

  if (!interaction.isButton()) return;


  if (interaction.customId === "roulette_join") {


    if (roulettePlayers.length >= 20)
      return interaction.reply({
        content:"❌ الروليت ممتلئة",
        ephemeral:true
      });


    if (roulettePlayers.includes(interaction.user))
      return interaction.reply({
        content:"⚠️ أنت داخل بالفعل",
        ephemeral:true
      });


    roulettePlayers.push(interaction.user);


    interaction.reply({
      content:"✅ دخلت الروليت 🎰",
      ephemeral:true
    });
  }



  if (interaction.customId === "roulette_leave") {


    roulettePlayers =
    roulettePlayers.filter(
      p => p.id !== interaction.user.id
    );


    interaction.reply({
      content:"🚪 خرجت من الروليت",
      ephemeral:true
    });
  }

});
