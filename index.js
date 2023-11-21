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
const internal = require("stream");
const configc = config.LOGKANAL;

client.on("messageCreate", async (message) => {
  if (message.channel.type === ChannelType.DM) {
    if (message.author.id === client.user.id) return;
    const icerik = `${message.content}`;
    const ilkbes = icerik.slice(0, 7);
    
    const geridonusv1 = new EmbedBuilder()
    .setTitle("✅ Başarılı")
    .setDescription("Gönderdiğiniz mesaj başarıyla sunucu yönetimine iletildi. En kısa süre içerisinde geri dönüş yapılacaktır")
    const olumludonus = new EmbedBuilder()
    .setTitle(`Olumlu 😃`)
    .setDescription("DM Üzerinden attığınız mesaj sunucu yönetimimiz tarafından incelenemiş ve onaylanmıştır.")
    const olumsuzdonus = new EmbedBuilder()
    .setTitle(`Olumsuz 😢`)
    .setDescription("DM Üzerinden attığınız mesaj sunucu yönetimimiz tarafından incelenemiş ve reddedilmiştir.")
    message.author.send({embeds: [geridonusv1]})
    

    const dmLogEmbed = new EmbedBuilder()
      .setTitle("Yeni bir öneri var!")
      .setFooter({ text: `${message.author.username} Tarafından gönderildi.`, iconURL: `${message.author.displayAvatarURL()}` })
      .setDescription(
        `İçerik: \n ${message.content}`)

    const buttonRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("approve")
          .setLabel("İsteği Kabul Et")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("reject")
          .setLabel("İsteği Reddet")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("offer")
          .setLabel("Onla konuşmayı teklif et")
          .setStyle(1)
      );

    client.channels.cache.get(configc)
      .send({ embeds: [dmLogEmbed], components: [buttonRow] })
      .then((sentMessage) => {
        const collector = sentMessage.createMessageComponentCollector();

        collector.on("collect", (interaction) => {
          if (interaction.customId === "reject") {
            message.author.send({embeds: [olumsuzdonus]});
            interaction.reply("Başarıyla kullanıcıya iletildi.");

          } else if (interaction.customId === "approve") {
            interaction.reply("Başarıyla kullanıcıya iletildi.");
            message.author.send({embeds: [olumludonus]});
          }

          else if (interaction.customId === "offer") {
            interaction.reply("Teklif gönderildi")
            const teklifEmbed = new EmbedBuilder()
    .setTitle("Huhu..")
    .setDescription(`Attığın mesaj (${ilkbes}...) <@${interaction.user.id}> yetkilisi tarafından incelendi ve seninle özel olarak konuşmak istiyor. Lütfen ona dm üzerinden ulaş.  `)
            message.author.send({embeds: [teklifEmbed]});
          }
          
        });
      });
  } else {
    return;
  }
});

client.login(Giris || process.env.token)

