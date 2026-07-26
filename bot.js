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


  if (message.content === "-ر") {


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
      .setLabel("🚪 خروج")
      .setStyle(ButtonStyle.Danger);



    const row = new ActionRowBuilder()
      .addComponents(
        joinButton,
        leaveButton
      );



    await message.channel.send({

      content:
`🎰 **روليت Xero**

🟢 دخول للمشاركة
🚪 خروج

⏳ البداية بعد 80 ثانية
👥 الحد الأقصى: 15 لاعب`,

      components:[row]

    });



    setTimeout(()=>{


      if(roulettePlayers.length < 2){

        rouletteRunning = false;

        return message.channel.send(
          "❌ عدد اللاعبين غير كافي"
        );

      }


      startRoulette(message.channel);


    },80000);



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

        label: p.username.slice(0,25),

        value: p.id

      }));



    const menu = new StringSelectMenuBuilder()

      .setCustomId("roulette_kick")

      .setPlaceholder("اختر لاعب لطرده")

      .addOptions(options);



    const leaveButton = new ButtonBuilder()

      .setCustomId("roulette_game_leave")

      .setLabel("🚪 انسحاب")

      .setStyle(ButtonStyle.Danger);



    const row1 = new ActionRowBuilder()
      .addComponents(menu);



    const row2 = new ActionRowBuilder()
      .addComponents(leaveButton);



    const msg = await channel.send({

      content:
`🎯 دور اللاعب ${chooser}

⏳ لديك 30 ثانية لاختيار لاعب لطرده`,

      components:[
        row1,
        row2
      ]

    });



    let kicked = false;



    const collector =
    msg.createMessageComponentCollector({

      time:30000

    });



    collector.on("collect", async(interaction)=>{



      if(interaction.customId === "roulette_kick"){


        if(interaction.user.id !== chooser.id){

          return interaction.reply({

            content:"❌ ليس دورك",

            ephemeral:true

          });

        }



        const target =
        roulettePlayers.find(
          p=>p.id === interaction.values[0]
        );



        roulettePlayers =
        roulettePlayers.filter(
          p=>p.id !== target.id
        );



        kicked = true;



        await interaction.update({

          content:
`💣 | تم طرد ${target} من اللعبة، سيتم بدء الجولة القادمة في بضع ثواني`,

          components:[]

        });



        collector.stop();


      }




      if(interaction.customId === "roulette_game_leave"){



        const player =
        roulettePlayers.find(
          p=>p.id === interaction.user.id
        );



        if(!player){

          return interaction.reply({

            content:"❌ أنت غير مشارك في اللعبة",

            ephemeral:true

          });

        }



        roulettePlayers =
        roulettePlayers.filter(
          p=>p.id !== interaction.user.id
        );



        await interaction.reply({

          content:
`🚪 لقد انسحب اللاعب ${interaction.user} من اللعبة، سيتم بدء الجولة القادمة في بضع ثواني`

        });



        collector.stop();


      }



    });



    await new Promise(resolve=>{

      collector.on("end",resolve);

    });




    if(!kicked){


      if(roulettePlayers.includes(chooser)){


        roulettePlayers =
        roulettePlayers.filter(
          p=>p.id !== chooser.id
        );



        await channel.send(

`❌ تم إخراج اللاعب ${chooser} لعدم تفاعله`

        );


      }


    }



    await new Promise(r=>setTimeout(r,3000));


  }




  await channel.send({

    content:
`👑 الفائز هو ${roulettePlayers[0]}!

🎉 مبروك`

  });



  roulettePlayers = [];

  rouletteRunning = false;


}
client.on("interactionCreate", async (interaction)=>{


if(!interaction.isButton()) return;



// دخول الروليت
if(interaction.customId === "roulette_join"){


if(!rouletteRunning){

return interaction.reply({

content:"❌ لا توجد روليت حاليا",

ephemeral:true

});

}



if(roulettePlayers.length >= 15){

return interaction.reply({

content:"❌ الروليت ممتلئة",

ephemeral:true

});

}



if(roulettePlayers.some(
p=>p.id === interaction.user.id
)){


return interaction.reply({

content:"❗ أنت مشارك بالفعل",

ephemeral:true

});

}



roulettePlayers.push(
interaction.user
);



return interaction.reply({

content:"✅ دخلت الروليت 🎰",

ephemeral:true

});

}





// خروج الروليت
if(interaction.customId === "roulette_leave"){


if(!roulettePlayers.some(
p=>p.id === interaction.user.id
)){


return interaction.reply({

content:"❌ أنت غير مشارك في اللعبة",

ephemeral:true

});


}



roulettePlayers =
roulettePlayers.filter(
p=>p.id !== interaction.user.id
);



return interaction.reply({

content:
`🚪 لقد انسحب اللاعب ${interaction.user} من اللعبة، سيتم بدء الجولة القادمة في بضع ثواني`

});


}


});





// ==========================
// 🪑 لعبة الكراسي
// ==========================


let chairPlayers = [];
let chairRunning = false;



client.on("messageCreate", async(message)=>{


if(message.author.bot) return;



if(message.content === "-ك"){



if(!message.member.permissions.has("Administrator")){

return message.reply(
"❌ للأداريين فقط"
);

}



if(chairRunning){

return message.reply(
"🪑 يوجد لعبة كراسي شغالة حاليا"
);

}



chairPlayers=[];
chairRunning=true;



const join = new ButtonBuilder()

.setCustomId("chair_join")

.setLabel("🪑 دخول")

.setStyle(ButtonStyle.Success);



const leave = new ButtonBuilder()

.setCustomId("chair_leave")

.setLabel("🚪 خروج")

.setStyle(ButtonStyle.Danger);



const row = new ActionRowBuilder()

.addComponents(
join,
leave
);



await message.channel.send({

content:
`🪑 **كراسي Xero**

🟢 دخول للمشاركة
🚪 خروج

⏳ البداية بعد 80 ثانية
👥 الحد الأقصى: 15 لاعب`,

components:[row]

});



setTimeout(()=>{


if(chairPlayers.length < 3){

chairRunning=false;

return message.channel.send(
"❌ عدد اللاعبين غير كافي"
);

}



startChairs(message.channel);


},80000);



}


});
async function startChairs(channel){


await channel.send(
`🪑 بدأت لعبة الكراسي بـ ${chairPlayers.length} لاعبين`
);



while(chairPlayers.length > 1){


await channel.send(
"🎵 بدأت الجولة..."
);



await new Promise(r=>setTimeout(r,5000));



// عدد الخارجين = عدد اللاعبين - عدد الكراسي
// الكراسي أقل من اللاعبين بـ 2
let removeCount = 2;



if(chairPlayers.length <= 3){

removeCount = 1;

}



let losers = [];



while(losers.length < removeCount){


let loser =
chairPlayers[
Math.floor(
Math.random()*chairPlayers.length
)
];



if(!losers.includes(loser)){

losers.push(loser);

}


}



chairPlayers =
chairPlayers.filter(
p=>!losers.includes(p)
);



for(const loser of losers){


await channel.send(

`💺❌ | تم إخراج اللاعب ${loser} لعدم وجود كرسي، سيتم بدء الجولة القادمة في بضع ثواني`

);


}



await new Promise(r=>setTimeout(r,3000));


}




await channel.send(

`👑 الفائز هو ${chairPlayers[0]}

🎉 مبروك`

);



chairPlayers=[];
chairRunning=false;


}





client.on("interactionCreate", async(interaction)=>{


if(!interaction.isButton()) return;



// دخول الكراسي

if(interaction.customId==="chair_join"){



if(!chairRunning){

return interaction.reply({

content:"❌ لا توجد لعبة حاليا",

ephemeral:true

});

}



if(chairPlayers.length>=15){

return interaction.reply({

content:"❌ اللعبة ممتلئة",

ephemeral:true

});

}



if(chairPlayers.some(
p=>p.id===interaction.user.id
)){


return interaction.reply({

content:"❗ أنت مشارك بالفعل",

ephemeral:true

});

}



chairPlayers.push(
interaction.user
);



return interaction.reply({

content:"✅ دخلت لعبة الكراسي 🪑",

ephemeral:true

});


}





// خروج الكراسي

if(interaction.customId==="chair_leave"){



if(!chairPlayers.some(
p=>p.id===interaction.user.id
)){


return interaction.reply({

content:"❌ أنت غير مشارك في اللعبة",

ephemeral:true

});

}



chairPlayers =
chairPlayers.filter(
p=>p.id!==interaction.user.id
);



return interaction.reply({

content:
`🚪 لقد انسحب اللاعب ${interaction.user} من اللعبة، سيتم بدء الجولة القادمة في بضع ثواني`

});


}



});
