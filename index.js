const { Client, GatewayIntentBits, Partials } = require("discord.js");
const INTENTS = Object.values(GatewayIntentBits);
const PARTIALS = Object.values(Partials);
const Discord = require("discord.js")
const db = require(`croxydb`)
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

const { ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,ModalBuilder,TextInputBuilder,TextInputStyle,InteractionType } = require("discord.js");
const internal = require("stream");
const configc = config.LOGKANAL;

const modal = new ModalBuilder()
.setCustomId('modal')
.setTitle('Yazı İle Cevaplama');

const yaziform = new TextInputBuilder()
.setCustomId('yaziform')
.setRequired(true)
.setMinLength(4)
.setPlaceholder('Teklifinizi okudum, en yakın zamanda yapacağım.')
.setLabel("Ona ne ile cevap vermek istersin")
.setStyle(TextInputStyle.Paragraph)

const idform = new TextInputBuilder()
.setCustomId('idform')
.setRequired(true)
.setMinLength(4)
.setPlaceholder(`Gömülümesajda belirtilen ID'yi yazın `)
.setLabel("Kullanıcı ID")
.setStyle(TextInputStyle.Paragraph)

const bir = new ActionRowBuilder().addComponents(yaziform);
modal.addComponents(bir);
const iki = new ActionRowBuilder().addComponents(idform);
modal.addComponents(iki);

client.on("messageCreate", async (message) => {
  if (message.channel.type === ChannelType.DM) {
    if (message.author.id === client.user.id) return;
    const icerik = `${message.content}`;
    const ilkbes = icerik.slice(0, 7);
    
    const geridonusv1 = new EmbedBuilder()
    .setTitle("✅ Başarılı")
    .setColor("36393F")
    .setDescription("Gönderdiğiniz mesaj başarıyla sunucu yönetimine iletildi. En kısa süre içerisinde geri dönüş yapılacaktır")
    const olumludonus = new EmbedBuilder()
    .setTitle(`Olumlu 😃`)
    .setColor("36393F")
    .setDescription("DM Üzerinden attığınız mesaj sunucu yönetimimiz tarafından incelenemiş ve onaylanmıştır.")
    const olumsuzdonus = new EmbedBuilder()
    .setTitle(`Olumsuz 😢`)
    .setDescription("DM Üzerinden attığınız mesaj sunucu yönetimimiz tarafından incelenemiş ve reddedilmiştir.")
    .setColor("36393F")
    message.author.send({embeds: [geridonusv1]})
    

    const dmLogEmbed = new EmbedBuilder()
      .setTitle("Yeni bir öneri var!")
      .setFooter({ text: `${message.author.username} Tarafından gönderildi.`, iconURL: `${message.author.displayAvatarURL()}` })
      .setDescription(
        `İçerik: \n ${message.content} \n \n ID: ${message.author.id} `)

    const buttonRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("approve")
          .setLabel("Olumlu")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("reject")
          .setLabel("Olumsuz")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("offer")
          .setLabel("Yazı İle Cevapla")
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

            

          } else if(interaction.customId === "offer" ) {
            
    interaction.showModal(modal);
}})})}})
client.on('interactionCreate', async (interaction) => {
  if(interaction.type !== InteractionType.ModalSubmit) return
    let cevap = interaction.fields.getTextInputValue('yaziform');
    let idtwo = interaction.fields.getTextInputValue('idform');
    const ozelcevap = new EmbedBuilder()
      .setTitle(`Geri Dönüş`)
      .setDescription(`Attığın mesaj yetkili tarafından incelendi ve sana şu cevabı verdi \n **${cevap}**`)
      .setColor('#00FF00');

    interaction.reply(`Yazı cevabınız iletildi`)

    const cooluser = client.users.cache.get(idtwo)
    cooluser.send({embeds: [ozelcevap]}).catch((er) => {
      console.error('Hata:', er)
    });
})

process.on("unhandledRejection", (reason) => {
  console.log(`Birisi geçersiz id girmeyi denedi`)
})

process.on("unhandledRejection", async (error) => {
  return console.log(`Birisi geçersiz id girmeyi denedi`)
})

client.login(Giris || process.env.token)