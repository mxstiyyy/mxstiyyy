const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel],
});

const prefix = '.';
let welcomeChannelId = '';
let welcomeMessage = 'Hoşgeldin, {user}!';
let autoRoleId = '';
let goodbyeMessage = '';

client.on('ready', () => {
  console.log(`Bot ${client.user.tag} olarak giriş yaptı!`);
});

client.on('guildMemberAdd', member => {
  // Hoşgeldin mesajı gönderme
  if (welcomeChannelId) {
    const channel = member.guild.channels.cache.get(welcomeChannelId);
    if (channel) {
      const message = welcomeMessage.replace('{user}', `<@${member.id}>`);
      channel.send(message);
    }
  }

  // Oto rol verme
  if (autoRoleId) {
    const role = member.guild.roles.cache.get(autoRoleId);
    if (role) {
      member.roles.add(role).catch(console.error);
    }
  }
});

client.on('guildMemberRemove', member => {
  if (goodbyeMessage && welcomeChannelId) {
    const channel = member.guild.channels.cache.get(welcomeChannelId);
    if (channel) {
      const message = goodbyeMessage.replace('{user}', `${member.user.tag}`);
      channel.send(message);
    }
  }
});

client.on('messageCreate', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'hosgeldin-kanal-ayarla') {
    const channel = message.mentions.channels.first();
    if (!channel) {
      return message.reply('Lütfen geçerli bir kanal etiketleyin!');
    }
    welcomeChannelId = channel.id;
    const embed = new EmbedBuilder()
      .setTitle('Hoşgeldin Kanalı Ayarlandı')
      .setDescription(`Hoşgeldin mesajları için kanal ayarlandı: ${channel}`)
      .setColor(0x00ff00);
    message.reply({ embeds: [embed] });
  }

  if (command === 'hosgeldin-mesaj-ayarla') {
    if (args.length === 0) {
      return message.reply('Lütfen bir hoşgeldin mesajı yazın!');
    }
    welcomeMessage = args.join(' ');
    const embed = new EmbedBuilder()
      .setTitle('Hoşgeldin Mesajı Ayarlandı')
      .setDescription(`Yeni hoşgeldin mesajı: "${welcomeMessage}"`)
      .setColor(0x00ff00);
    message.reply({ embeds: [embed] });
  }

  if (command === 'otorol-ayarla') {
    const role = message.mentions.roles.first();
    if (!role) {
      return message.reply('Lütfen geçerli bir rol etiketleyin!');
    }
    autoRoleId = role.id;
    const embed = new EmbedBuilder()
      .setTitle('Oto Rol Ayarlandı')
      .setDescription(`Yeni üyelere otomatik olarak verilecek rol: ${role.name}`)
      .setColor(0x00ff00);
    message.reply({ embeds: [embed] });
  }

  if (command === 'sunucu-bilgi') {
    const { guild } = message;
    const embed = new EmbedBuilder()
      .setTitle(`${guild.name} Bilgileri`)
      .addFields(
        { name: 'Üye Sayısı', value: `${guild.memberCount}`, inline: true },
        { name: 'Kanal Sayısı', value: `${guild.channels.cache.size}`, inline: true },
        { name: 'Oluşturulma Tarihi', value: `${guild.createdAt.toDateString()}`, inline: false },
      )
      .setColor(0x00ff00)
      .setTimestamp()
      .setFooter({ text: 'Sunucu Bilgisi' });
    message.channel.send({ embeds: [embed] });
  }

  if (command === 'kullanıcı-bilgi') {
    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);

    const embed = new EmbedBuilder()
      .setTitle(`${user.tag} Bilgileri`)
      .addFields(
        { name: 'Kullanıcı ID', value: `${user.id}`, inline: true },
        { name: 'Katılma Tarihi', value: `${member.joinedAt.toDateString()}`, inline: true },
        { name: 'Roller', value: `${member.roles.cache.map(role => role.name).join(', ')}`, inline: false },
      )
      .setColor(0x0000ff)
      .setTimestamp()
      .setFooter({ text: 'Kullanıcı Bilgisi' });
    message.channel.send({ embeds: [embed] });
  }

  if (command === 'bot-bilgi') {
    const embed = new EmbedBuilder()
      .setTitle('Bot Bilgisi')
      .addFields(
        { name: 'Bot Sahibi', value: 'Senin Kullanıcı Adın', inline: true },
        { name: 'Oluşturulma Tarihi', value: `${client.user.createdAt.toDateString()}`, inline: false },
      )
      .setColor(0x00ff00);
    message.channel.send({ embeds: [embed] });
  }

  if (command === 'cikis-mesaj-ayarla') {
    if (args.length === 0) {
      return message.reply('Lütfen bir çıkış mesajı yazın!');
    }
    goodbyeMessage = args.join(' ');
    const embed = new EmbedBuilder()
      .setTitle('Çıkış Mesajı Ayarlandı')
      .setDescription(`Yeni çıkış mesajı: "${goodbyeMessage}"`)
      .setColor(0xff0000);
    message.reply({ embeds: [embed] });
  }

  if (command === 'yardim') {
    const embed = new EmbedBuilder()
      .setTitle('Yardım Menüsü')
      .setDescription('Hoşgeldin Botu Komutları:')
      .addFields(
        { name: `${prefix}hosgeldin-kanal-ayarla #kanal`, value: 'Hoşgeldin mesajlarının gönderileceği kanalı ayarlar.' },
        { name: `${prefix}hosgeldin-mesaj-ayarla [mesaj]`, value: 'Hoşgeldin mesajını ayarlar. `{user}` ile kullanıcı etiketlenir.' },
        { name: `${prefix}otorol-ayarla @rol`, value: 'Sunucuya katılanlara otomatik olarak verilecek rolü ayarlar.' },
        { name: `${prefix}sunucu-bilgi`, value: 'Sunucu hakkında genel bilgileri gösterir.' },
        { name: `${prefix}kullanıcı-bilgi @kullanıcı`, value: 'Belirtilen kullanıcı hakkında bilgi verir.' },
        { name: `${prefix}bot-bilgi`, value: 'Bot hakkında bilgi verir.' },
        { name: `${prefix}cikis-mesaj-ayarla [mesaj]`, value: 'Sunucudan ayrılan üyelere gönderilecek mesajı ayarlar.' },
      )
      .setColor(0x00ffff);
    message.reply({ embeds: [embed] });
  }
});

client.login('botun_tokeni');

