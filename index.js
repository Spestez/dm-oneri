const { Client, GatewayIntentBits, Partials } = require("discord.js");
const INTENTS = Object.values(GatewayIntentBits);
const PARTIALS = Object.values(Partials);
const Discord = require("discord.js")

const client = new Client({
    intents: INTENTS,
    allowedMentions: {
        parse: ["users"]
    },
    partials: PARTIALS,
    retryLimit: 3
});

global.client = client;
client.commands = (global.commands = []);

const { readdirSync } = require("fs")
const config = require("./config.json");
let Giris = config.TOKEN
readdirSync('./komutlar').forEach(f => {
  if(!f.endsWith(".js")) return;

 const props = require(`./komutlar/${f}`);

 client.commands.push({
       name: props.name.toLowerCase(),
       description: props.description,
       options: props.options,
       dm_permission: props.dm_permission,
       type: 1
 });

console.log(`${props.name} Başarıyla yüklendi`)

});
readdirSync('./eventler').forEach(e => {

  const eve = require(`./eventler/${e}`);
  const name = e.split(".")[0];

  client.on(name, (...args) => {
            eve(client, ...args)
        });
});

const { ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const configc = config.LOGKANAL;

client.on("messageCreate", async (message) => {
  if (message.channel.type === ChannelType.DM) {
    if (message.author.id === client.user.id) return;

    const dmLogEmbed = new EmbedBuilder()
      .setTitle("Bota DM Atıldı")
      .setDescription(
        `Gönderen: [${message.author.username}](https://discord.com/users/${message.author.id})`
      )
      .addFields({ name: "Mesaj İçeriği", value: `${message.content}`, inline: true });

    const buttonRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("approve")
          .setLabel("Onayla")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("reject")
          .setLabel("Reddet")
          .setStyle(ButtonStyle.Danger)
      );

    client.channels.cache.get(configc)
      .send({ embeds: [dmLogEmbed], components: [buttonRow] })
      .then((sentMessage) => {
        const collector = sentMessage.createMessageComponentCollector();

        collector.on("collect", (interaction) => {
          if (interaction.customId === "reject") {
            message.author.send("Attığınız mesaj yetkililer tarafından reddedilmiştir :/");
            interaction.reply("İşlem başarılı oldu.");
          } else if (interaction.customId === "approve") {
            interaction.reply("İşlem başarılı oldu.");
            message.author.send("Attığınız mesaj yetkililer tarafından onaylanmıştır.");
          }
        });
      });
  } else {
    return;
  }
});

client.login(Giris || process.env.token)

