const { zokou } = require("../framework/zokou");
const yts = require("yt-search");
const ytdl = require("ytdl-core");
const fs = require('fs');

// Commande "play"
zokou({
  nomCom: "play",
  categorie: "Search",
  reaction: '💿'
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;
  if (!arg[0]) {
    return repondre("Veuillez insérer un nom de chanson.");
  }
  try {
    let query = arg.join(" ");
    const resultats = await yts(query);
    const videos = resultats.videos;
    if (videos && videos.length > 0 && videos[0]) {
      const videoUrl = videos[0].url;
      let messageImage = {
        image: { url: videos[0].thumbnail },
        caption: `*ZOKOU SONG PLAYER*\n\n╭───────────────◆\n│⿻ *Titre:* ${videos[0].title}\n│⿻ *Durée:* ${videos[0].timestamp}\n│⿻ *Vues:* ${videos[0].views}\n│⿻ *Publié:* ${videos[0].ago}\n│⿻ *Artiste:* ${videos[0].author.name}\n╰────────────────◆\n⦿ *Lien direct:* ${videos[0].url}\n\n╭────────────────◆\n│ *_Propulsé par Zokou._*\n╰─────────────────◆`
      };
      await zk.sendMessage(dest, messageImage, { quoted: ms });

      const stream = ytdl(videoUrl, { filter: 'audioonly', quality: "highestaudio" });
      const writer = fs.createWriteStream("audio.mp3");
      stream.pipe(writer);
      writer.on("finish", async () => {
        await zk.sendMessage(dest, { audio: fs.readFileSync("audio.mp3"), mimetype: "audio/mp4" }, { quoted: ms });
        fs.unlinkSync("audio.mp3");
      });
    } else {
      repondre("Aucune vidéo trouvée.");
    }
  } catch (error) {
    console.error("Erreur:", error);
    repondre("Une erreur est survenue lors de la recherche ou du téléchargement de la vidéo.");
  }
});

// Commande "video"
zokou({
  nomCom: "video",
  categorie: "Search",
  reaction: '🎥'
}, async (dest, zk, commandeOptions) => {
  const { arg, ms, repondre } = commandeOptions;
  if (!arg[0]) {
    return repondre("Insérez un nom de vidéo");
  }
  const query = arg.join(" ");
  try {
    const resultats = await yts(query);
    const videos = resultats.videos;
    if (videos && videos.length > 0 && videos[0]) {
      const video = videos[0];
      let messageImage = {
        image: { url: videos[0].thumbnail },
        caption: `*ZOKOU VIDEO DOWNLOADER*\n\n╭───────────────◆\n│⿻ *Titre:* ${video.title}\n│⿻ *Durée:* ${video.timestamp}\n│⿻ *Vues:* ${video.views}\n│⿻ *Publié:* ${video.ago}\n│⿻ *Auteur:* ${video.author.name}\n╰────────────────◆\n⦿ *Lien direct:* ${video.url}\n\n╭───────────────◆\n│ *_Propulsé par Zokou._*\n╰────────────────◆ `
      };
      await zk.sendMessage(dest, messageImage, { quoted: ms });

      const info = await ytdl.getInfo(video.url);
      const format = ytdl.chooseFormat(info.formats, { quality: '18' });
      const stream = ytdl.downloadFromInfo(info, { format: format });
      const writer = fs.createWriteStream('video.mp4');
      stream.pipe(writer);
      writer.on("finish", async () => {
        await zk.sendMessage(dest, { video: fs.readFileSync("video.mp4"), caption: "╭───────────────◆\n│ *ZOKOU DOWNLOADER*\n╰────────────────◆" }, { quoted: ms });
        fs.unlinkSync("video.mp4");
      });
    } else {
      repondre("Aucune vidéo trouvée");
    }
  } catch (error) {
    console.error("Erreur:", error);
    repondre("Une erreur est survenue lors de la recherche ou du téléchargement de la vidéo.");
  }
});

// Commande "mygroups"
zokou({
  nomCom: "mygroups",
  categorie: "User",
  reaction: '💿'
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre } = commandeOptions;
  try {
    let groups = await zk.groupFetchAllParticipating();
    let ownedGroups = Object.entries(groups).slice(0).map(entry => entry[1]);
    let messageText = "*GROUPES DONT JE FAIS PARTIE*\n\n";
    await repondre(`Vous êtes actuellement dans ${ownedGroups.length} groupes, Zokou va envoyer cette liste dans un instant...`);
    for (let group of ownedGroups) {
      messageText += `*NOM DU GROUPE:* ${group.subject}\n`;
      messageText += `*MEMBRES:* ${group.participants.length}\n`;
      messageText += `*ID DU GROUPE:* ${group.id}\n\n`;
    }
    await repondre(messageText);
  } catch (error) {
    console.error("Erreur:", error);
    repondre("Une erreur est survenue lors de la récupération des informations des groupes.");
  }
});

// Commande "song"
zokou({
  nomCom: 'song',
  categorie: "Search",
  reaction: '💿'
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;
  if (!arg[0]) {
    return repondre("Veuillez insérer un nom de chanson.");
  }
  try {
    let query = arg.join(" ");
    const resultats = await yts(query);
    const videos = resultats.videos;
    if (videos && videos.length > 0 && videos[0]) {
      const videoUrl = videos[0].url;
      let messageImage = {
        image: { url: videos[0].thumbnail },
        caption: `*ZOKOU SONG DOWNLOADER*\n\n╭───────────────◆\n│⿻ *Titre:* ${videos[0].title}\n│⿻ *Durée:* ${videos[0].timestamp}\n│⿻ *Vues:* ${videos[0].views}\n│⿻ *Publié:* ${videos[0].ago}\n│⿻ *Auteur:* ${videos[0].author.name}\n╰────────────────◆\n⦿ *Lien direct:* ${videos[0].url}\n\n╭────────────────◆\n│ *_Propulsé par Zokou._*\n╰─────────────────◆`
      };
      await zk.sendMessage(dest, messageImage, { quoted: ms });

      const stream = ytdl(videoUrl, { filter: 'audioonly', quality: "highestaudio" });
      const writer = fs.createWriteStream("audio.mp3");
      stream.pipe(writer);
      writer.on("finish", async () => {
        await zk.sendMessage(dest, { document: fs.readFileSync("audio.mp3"), mimetype: 'audio/mp4', fileName: `${videos[0].title}.mp3` }, { quoted: ms });
        fs.unlinkSync("audio.mp3");
      });
    } else {
      repondre("Aucune vidéo trouvée.");
    }
  } catch (error) {
    console.error("Erreur:", error);
    repondre("Une erreur est survenue lors de la recherche ou du téléchargement de la vidéo.");
  }
});
