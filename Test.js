const {
  makeWASocket,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  DisconnectReason,
  makeInMemoryStore,
  getContentType,
  jidDecode,
  delay,
  downloadMediaMessage,
  downloadContentFromMessage
} = require("@whiskeysockets/baileys");
const {
  Boom
} = require("@hapi/boom");
const {
  default: pino
} = require("pino");
const conf = require('./set');
const fs = require("fs-extra");
let evt = require('./framework/zokou');
const {
  reagir
} = require("./framework/app");
let path = require("path");
const FileType = require("file-type");
const {
  Sticker,
  StickerTypes
} = require("wa-sticker-formatter");
var session = conf.session.replace(/Zokou-MD-WHATSAPP-BOT;;;=>/g, '');
const NodeCache = require('node-cache');
const prefixe = conf.PREFIXE;
const {
  verifierEtatJid,
  recupererActionJid
} = require("./bdd/antilien");
const {
  atbverifierEtatJid,
  atbrecupererActionJid
} = require("./bdd/antibot");
const {
  isUserBanned,
  addUserToBanList,
  removeUserFromBanList
} = require('./bdd/banUser');
const {
  addGroupToBanList,
  isGroupBanned,
  removeGroupFromBanList
} = require('./bdd/banGroup');
const {
  isGroupOnlyAdmin,
  addGroupToOnlyAdminList,
  removeGroupFromOnlyAdminList
} = require('./bdd/onlyAdmin');
const {
  recupevents
} = require('./bdd/welcome');
const {
  isGroupspam
} = require("./bdd/antispam");
const {
  dbCache
} = require("./cache");
async function authentification() {
  try {
    if (!fs.existsSync(__dirname + "/auth/creds.json")) {
      console.log("connexion depuis la variable session_id");
      await fs.writeFileSync(__dirname + "/auth/creds.json", atob(session), 'utf8');
    } else if (fs.existsSync(__dirname + '/auth/creds.json') && session != "zokk") {
      console.log("-------------en cours----------------");
      await fs.writeFileSync(__dirname + '/auth/creds.json', atob(session), "utf8");
    }
  } catch (_0x11139b) {
    console.log("Session Invalide " + _0x11139b);
    return;
  }
}
authentification();
const logger = pino({
  'level': "silent"
});
const groupMetadataCache = new NodeCache({
  'stdTTL': 0x1770,
  'checkperiod': 0x1388
});
const CmdColdCache = new NodeCache({
  'stdTTL': 0x3c,
  'checkperiod': 0x3c
});
const store = makeInMemoryStore({
  'logger': pino().child({
    'level': "silent",
    'stream': "store"
  })
});
store.readFromFile('store.json');
setInterval(() => {
  store.writeToFile('store.json');
}, 0x2710);
async function connectToWhatsapp() {
  const {
    saveCreds: _0x5e160c,
    state: _0x3f4d4a
  } = await useMultiFileAuthState("./auth");
  const {
    version: _0x5ab4c2,
    isLatest: _0x10a1eb
  } = await fetchLatestBaileysVersion();
  const _0x59d506 = makeWASocket({
    'version': _0x5ab4c2,
    'logger': logger,
    'browser': ["Zokou-md", "safari", "1.0.0"],
    'emitOwnEvents': true,
    'syncFullHistory': true,
    'printQRInTerminal': true,
    'markOnlineOnConnect': false,
    'receivedPendingNotifications': true,
    'generateHighQualityLinkPreview': true,
    'auth': {
      'creds': _0x3f4d4a.creds,
      'keys': makeCacheableSignalKeyStore(_0x3f4d4a.keys, logger)
    },
    'keepAliveIntervalMs': 0x7530,
    'getMessage': async _0x3b3759 => {
      if (store) {
        const _0x1d527f = await store.loadMessage(_0x3b3759.remoteJid, _0x3b3759.id);
        return _0x1d527f?.["message"] || undefined;
      }
    }
  });
  store?.['bind'](_0x59d506.ev);
  const _0x56519c = new NodeCache({
    'stdTTL': 0x78,
    'checkperiod': 0xf0
  });
  _0x59d506.ev.on("messages.upsert", async _0x429e50 => {
    const {
      messages: _0x4fc221
    } = _0x429e50;
    const _0x239233 = _0x4fc221[0x0];
    if (!_0x239233.message) {
      return;
    }
    const _0x53602e = _0x543711 => {
      if (!_0x543711) {
        return _0x543711;
      }
      if (/:\d+@/gi.test(_0x543711)) {
        let _0x534104 = jidDecode(_0x543711) || {};
        return _0x534104.user && _0x534104.server && _0x534104.user + '@' + _0x534104.server || _0x543711;
      } else {
        return _0x543711;
      }
    };
    var _0x384a58 = getContentType(_0x239233.message);
    var _0x41edd6 = _0x384a58 == "conversation" ? _0x239233.message.conversation : _0x384a58 == "imageMessage" ? _0x239233.message.imageMessage?.["caption"] : _0x384a58 == "videoMessage" ? _0x239233.message.videoMessage?.['caption'] : _0x384a58 == "extendedTextMessage" ? _0x239233.message?.["extendedTextMessage"]?.["text"] : _0x384a58 == "buttonsResponseMessage" ? _0x239233.message.buttonsResponseMessage?.["selectedButtonId"] : _0x384a58 == "listResponseMessage" ? _0x239233.message?.["listResponseMessage"]["singleSelectReply"]["selectedRowId"] : _0x384a58 == "messageContextInfo" ? _0x239233.message?.['buttonsResponseMessage']?.['selectedButtonId'] || _0x239233.message?.['listResponseMessage']["singleSelectReply"]["selectedRowId"] || _0x239233.test : '';
    var _0x45f822 = _0x239233.key.remoteJid;
    var _0x5d8568 = _0x53602e(_0x59d506.user.id);
    var _0x19be2c = _0x5d8568.split('@')[0x0];
    const _0x162f10 = _0x45f822?.["endsWith"]('@g.us');
    var _0x22e0f9 = null;
    if (_0x162f10) {
      if (groupMetadataCache.has(_0x45f822)) {
        _0x22e0f9 = groupMetadataCache.get(_0x45f822);
      } else {
        metadata = await _0x59d506.groupMetadata(_0x45f822);
        _0x22e0f9 = metadata;
        groupMetadataCache.set(_0x45f822, metadata);
      }
    }
    var _0x4e8ce4 = _0x162f10 ? _0x22e0f9.subject : null;
    var _0x585d22 = _0x239233.message?.['extendedTextMessage']?.["contextInfo"]?.["quotedMessage"];
    var _0x553a13 = _0x53602e(_0x239233.message?.["extendedTextMessage"]?.["contextInfo"]?.["participant"]);
    var _0x37a424 = _0x162f10 ? _0x239233.key.participant ? _0x239233.key.participant : _0x239233.participant : _0x45f822;
    if (_0x239233.key.fromMe) {
      _0x37a424 = _0x5d8568;
    }
    var _0x2cd4c8 = _0x162f10 ? _0x239233.key.participant : null;
    const {
      getAllSudoNumbers: _0x3a4312
    } = require("./bdd/sudo");
    const _0x3b68cd = _0x239233.pushName;
    let _0x20b21f;
    if (dbCache.has('sudo')) {
      console.log("fetching from cache");
      _0x20b21f = dbCache.get('sudo');
    } else {
      console.log("fetching from database");
      _0x20b21f = await _0x3a4312();
      dbCache.set("sudo", _0x20b21f);
    }
    const _0x2cdec4 = [_0x19be2c, "22559763447", "22543343357", '22564297888', "22891733300", "‪99393228‬", conf.NUMERO_OWNER].map(_0x504101 => _0x504101.replace(/[^0-9]/g) + '@s.whatsapp.net');
    const _0x104bd0 = [..._0x20b21f, ..._0x2cdec4];
    const _0x53e9af = _0x104bd0.includes(_0x37a424);
    var _0x57dfc0 = ["22559763447", "22543343357", '22564297888', "‪99393228‬", "22891733300"].map(_0x339129 => _0x339129.replace(/[^0-9]/g) + "@s.whatsapp.net").includes(_0x37a424);
    function _0x540c51(_0x4f9fde) {
      _0x59d506.sendMessage(_0x45f822, {
        'text': _0x4f9fde
      }, {
        'quoted': _0x239233
      });
    }
    console.log("\t [][]...{Zokou-Md}...[][]");
    console.log("=========== Nouveau message ===========");
    if (_0x162f10) {
      console.log("message provenant du groupe : " + _0x4e8ce4);
    }
    console.log("message envoyé par : [" + _0x3b68cd + " : " + _0x37a424.split("@s.whatsapp.net")[0x0] + " ]");
    console.log("type de message : " + _0x384a58);
    console.log("------ contenu du message ------");
    console.log(_0x41edd6);
    function _0x14b416(_0x143e8f) {
      let _0x48c643 = [];
      for (_0x429e50 of _0x143e8f) {
        if (_0x429e50.admin == null) {
          continue;
        }
        _0x48c643.push(_0x429e50.id);
      }
      return _0x48c643;
    }
    const _0x458a20 = _0x162f10 ? await _0x22e0f9.participants : '';
    let _0x390741 = _0x162f10 ? _0x14b416(_0x458a20) : '';
    const _0x1d2cbf = _0x162f10 ? _0x390741.includes(_0x37a424) : false;
    var _0x11842f = _0x162f10 ? _0x390741.includes(_0x5d8568) : false;
    var _0x22b136 = conf.ETAT;
    if (_0x22b136 == 0x1) {
      await _0x59d506.sendPresenceUpdate("available", _0x45f822);
    } else {
      if (_0x22b136 == 0x2) {
        await _0x59d506.sendPresenceUpdate('composing', _0x45f822);
      } else {
        if (_0x22b136 == 0x3) {
          await _0x59d506.sendPresenceUpdate("recording", _0x45f822);
        } else {}
      }
    }
    let _0x392b37 = _0x41edd6 ? _0x41edd6.trim().split(/ +/).slice(0x1) : null;
    let _0x1ce3d7 = _0x41edd6 ? _0x41edd6.startsWith(prefixe) : false;
    let _0x52a869 = _0x1ce3d7 ? _0x41edd6.slice(0x1).trim().split(/ +/).shift().toLowerCase() : false;
    const _0x50b54f = conf.URL.split(',');
    function _0x3b40f7() {
      const _0x1c574a = Math.floor(Math.random() * _0x50b54f.length);
      const _0xae3827 = _0x50b54f[_0x1c574a];
      return _0xae3827;
    }
    var _0x39d45e = {
      'superUser': _0x53e9af,
      'dev': _0x57dfc0,
      'verifGroupe': _0x162f10,
      'mbre': _0x458a20,
      'membreGroupe': _0x2cd4c8,
      'verifAdmin': _0x1d2cbf,
      'infosGroupe': _0x22e0f9,
      'nomGroupe': _0x4e8ce4,
      'auteurMessage': _0x37a424,
      'nomAuteurMessage': _0x3b68cd,
      'idBot': _0x5d8568,
      'verifZokouAdmin': _0x11842f,
      'prefixe': prefixe,
      'arg': _0x392b37,
      'repondre': _0x540c51,
      'mtype': _0x384a58,
      'groupeAdmin': _0x14b416,
      'msgRepondu': _0x585d22,
      'auteurMsgRepondu': _0x553a13,
      'ms': _0x239233,
      'mybotpic': _0x3b40f7
    };
    if (_0x37a424.endsWith("s.whatsapp.net")) {
      const {
        ajouterOuMettreAJourUserData: _0x715896
      } = require("./bdd/level");
      try {
        await _0x715896(_0x37a424);
      } catch (_0x936546) {
        console.error(_0x936546);
      }
    }
    if (_0x239233.message?.["stickerMessage"]) {
      const _0x11ed2b = require('./bdd/stickcmd');
      let _0x11edcb = _0x239233.message.stickerMessage.mediaKey.join(',');
      let _0x96c98c = await _0x11ed2b.inStickCmd(_0x11edcb);
      if (_0x96c98c) {
        _0x41edd6 = prefixe + (await _0x11ed2b.getCmdById(_0x11edcb));
        _0x392b37 = _0x41edd6 ? _0x41edd6.trim().split(/ +/).slice(0x1) : null;
        _0x1ce3d7 = _0x41edd6 ? _0x41edd6.startsWith(prefixe) : false;
        _0x52a869 = _0x1ce3d7 ? _0x41edd6.slice(0x1).trim().split(/ +/).shift().toLowerCase() : false;
        _0x585d22 = _0x239233.message.stickerMessage?.["contextInfo"]?.['quotedMessage'];
        _0x553a13 = _0x53602e(_0x239233.message?.["stickerMessage"]?.["contextInfo"]?.["participant"]);
        _0x39d45e = {
          'superUser': _0x53e9af,
          'dev': _0x57dfc0,
          'verifGroupe': _0x162f10,
          'mbre': _0x458a20,
          'membreGroupe': _0x2cd4c8,
          'verifAdmin': _0x1d2cbf,
          'infosGroupe': _0x22e0f9,
          'nomGroupe': _0x4e8ce4,
          'auteurMessage': _0x37a424,
          'nomAuteurMessage': _0x3b68cd,
          'idBot': _0x5d8568,
          'verifZokouAdmin': _0x11842f,
          'prefixe': prefixe,
          'arg': _0x392b37,
          'repondre': _0x540c51,
          'mtype': _0x384a58,
          'groupeAdmin': _0x14b416,
          'msgRepondu': _0x585d22,
          'auteurMsgRepondu': _0x553a13,
          'ms': _0x239233,
          'mybotpic': _0x3b40f7
        };
      }
      ;
    }
    if (_0x1ce3d7) {
      const _0x3f4197 = evt.cm.find(_0x3a0682 => _0x3a0682.nomCom === _0x52a869);
      if (_0x3f4197) {
        let _0x179d26;
        if (dbCache.has("bangroup")) {
          _0x179d26 = dbCache.get("bangroup").includes(_0x45f822);
        } else {
          let _0x49f103 = await isGroupBanned();
          _0x179d26 = _0x49f103.includes(_0x45f822);
          dbCache.set("bangroup", _0x49f103);
        }
        let _0x4bc3fc;
        if (dbCache.has("onlyadmin")) {
          _0x4bc3fc = dbCache.get('onlyadmin').includes(_0x45f822);
        } else {
          let _0x5b314d = await isGroupOnlyAdmin();
          _0x4bc3fc = _0x5b314d.includes(_0x45f822);
          dbCache.set("onlyadmin", _0x5b314d);
        }
        let _0x4e058d;
        if (dbCache.has("banuser")) {
          _0x4e058d = dbCache.get("banuser").includes(_0x37a424);
        } else {
          let _0x36de0f = await isUserBanned();
          _0x4e058d = _0x36de0f.includes(_0x37a424);
          dbCache.set("banuser", _0x36de0f);
        }
        if (conf.MODE.toLocaleLowerCase() === "oui" || _0x53e9af) {
          if (!_0x57dfc0 && _0x45f822 == '120363158701337904@g.us') {
            console.log("refused");
          } else {
            if (!_0x53e9af && _0x45f822 === _0x37a424 && conf.PM_PERMIT === "oui") {
              console.log("PM_PERMIT ACTIVER");
            } else {
              if (_0x162f10 && !_0x53e9af && _0x179d26) {
                console.log("Group Bannis");
              } else {
                if (!(_0x1d2cbf || _0x53e9af) && _0x162f10 && _0x4bc3fc) {
                  console.log("group on only admin");
                } else {
                  if (!_0x53e9af && _0x4e058d) {
                    _0x540c51("Vous n'avez plus acces au commandes du bots");
                  } else {
                    if (!_0x53e9af && conf.ANTI_CMD_SPAM.toLowerCase() == "oui" && CmdColdCache.has(_0x37a424)) {
                      _0x540c51("Veillez eviter de spammer, patienter " + Math.round((CmdColdCache.getTtl(_0x37a424) - Date.now()) / 0x3e8) + " secondes pour reutiliser a nouveau");
                    } else {
                      if (!_0x53e9af && conf.ANTI_CMD_SPAM.toLowerCase() == "oui") {
                        CmdColdCache.set(_0x37a424, true);
                      }
                      try {
                        reagir(_0x45f822, _0x59d506, _0x239233, _0x3f4197.reaction);
                        _0x3f4197.fonction(_0x45f822, _0x59d506, _0x39d45e);
                      } catch (_0x236280) {
                        console.log("😡😡 " + _0x236280);
                        _0x59d506.sendMessage(_0x45f822, {
                          'text': "😡😡 " + _0x236280
                        }, {
                          'quoted': _0x239233
                        });
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    ;
    if (_0x239233.key && _0x239233.key.remoteJid === "status@broadcast" && conf.LECTURE_AUTO_STATUS.toLowerCase() === "oui") {
      await _0x59d506.readMessages([_0x239233.key])["catch"](_0x1d2556 => console.log(_0x1d2556));
    }
    if (_0x239233.key && _0x239233.key.remoteJid === "status@broadcast" && conf.TELECHARGER_AUTO_STATUS.toLowerCase() === "oui") {
      try {
        if (_0x239233.message.extendedTextMessage) {
          var _0x102dd3 = _0x239233.message.extendedTextMessage.text;
          await _0x59d506.sendMessage(_0x5d8568, {
            'text': _0x102dd3
          }, {
            'quoted': _0x239233
          });
        } else {
          if (_0x239233.message.imageMessage) {
            var _0xa3bf12 = _0x239233.message.imageMessage.caption;
            var _0x371315 = await _0x59d506.downloadAndSaveMediaMessage(_0x239233.message.imageMessage);
            await _0x59d506.sendMessage(_0x5d8568, {
              'image': {
                'url': _0x371315
              },
              'caption': _0xa3bf12
            }, {
              'quoted': _0x239233
            });
          } else {
            if (_0x239233.message.videoMessage) {
              var _0xa3bf12 = _0x239233.message.videoMessage.caption;
              var _0x2b9657 = await _0x59d506.downloadAndSaveMediaMessage(_0x239233.message.videoMessage);
              await _0x59d506.sendMessage(_0x5d8568, {
                'video': {
                  'url': _0x2b9657
                },
                'caption': _0xa3bf12
              }, {
                'quoted': _0x239233
              });
            } else {
              if (_0x239233.message.audioMessage) {
                var _0xb2c2a3 = await _0x59d506.downloadAndSaveMediaMessage(_0x239233.message.audioMessage);
                await _0x59d506.sendMessage(_0x5d8568, {
                  'audio': {
                    'url': _0xb2c2a3
                  },
                  'mimetype': "audio/mp4"
                }, {
                  'quoted': _0x239233
                });
              }
            }
          }
        }
      } catch (_0x33d55f) {
        console.error(_0x33d55f);
      }
    }
    if ((_0x41edd6.toLocaleLowerCase().includes("https://") || _0x41edd6.toLocaleLowerCase().includes("http://")) && _0x162f10) {
      console.log("lien detecté");
      const _0xca5816 = await verifierEtatJid(_0x45f822);
      if (_0xca5816) {
        if (!_0x11842f) {
          _0x540c51("lien detecté ,  j'ai besoin des droits d'administrateur pour agir");
        } else {
          if (!_0x53e9af && !_0x1d2cbf) {
            const _0x5740ad = {
              'remoteJid': _0x45f822,
              'fromMe': false,
              'id': _0x239233.key.id,
              'participant': _0x37a424
            };
            var _0x27027b = "lien détecté, \n";
            var _0xd47402 = await recupererActionJid(_0x45f822);
            if (_0xd47402 === "retirer") {
              var _0x1b6cb1 = new Sticker("https://raw.githubusercontent.com/djalega8000/Zokou-MD/main/media/remover.gif", {
                'pack': 'Zoou-Md',
                'author': conf.NOM_OWNER,
                'type': StickerTypes.FULL,
                'categories': ['🤩', '🎉'],
                'id': "12345",
                'quality': 0x32,
                'background': "#000000"
              });
              await _0x1b6cb1.toFile("st1.webp");
              _0x27027b += "message supprimé \n @" + _0x37a424.split('@')[0x0] + " rétiré du groupe.";
              await _0x59d506.sendMessage(_0x45f822, {
                'sticker': fs.readFileSync('st1.webp')
              }, {
                'quoted': _0x239233
              });
              0x0;
              baileys_1.delay(0x320);
              await _0x59d506.sendMessage(_0x45f822, {
                'text': _0x27027b,
                'mentions': [_0x37a424]
              }, {
                'quoted': _0x239233
              });
              try {
                await _0x59d506.groupParticipantsUpdate(_0x45f822, [_0x37a424], "remove");
              } catch (_0x51d3b7) {
                console.log("antiien " + _0x51d3b7);
              }
              await _0x59d506.sendMessage(_0x45f822, {
                'delete': _0x5740ad
              });
              await fs.unlink("st1.webp");
            } else {
              if (_0xd47402 === "supp") {
                _0x27027b += "message supprimé \n @" + _0x37a424.split('@')[0x0] + " veillez eviter d'envoyer des lien.";
                await _0x59d506.sendMessage(_0x45f822, {
                  'text': _0x27027b,
                  'mentions': [_0x37a424]
                }, {
                  'quoted': _0x239233
                });
                await _0x59d506.sendMessage(_0x45f822, {
                  'delete': _0x5740ad
                });
              } else {
                if (_0xd47402 === "warn") {
                  const {
                    getWarnCountByJID: _0x4e1318,
                    ajouterUtilisateurAvecWarnCount: _0x158c53
                  } = require("./bdd/warn");
                  let _0x24b486 = await _0x4e1318(_0x37a424);
                  let _0x353122 = conf.WARN_COUNT;
                  if (_0x24b486 >= _0x353122) {
                    var _0x1b6cb1 = new Sticker("https://raw.githubusercontent.com/djalega8000/Zokou-MD/main/media/remover.gif", {
                      'pack': "Zoou-Md",
                      'author': conf.NOM_OWNER,
                      'type': StickerTypes.FULL,
                      'categories': ['🤩', '🎉'],
                      'id': "12345",
                      'quality': 0x32,
                      'background': '#000000'
                    });
                    await _0x1b6cb1.toFile("st1.webp");
                    var _0x36c007 = "Lien detecté ; vous avez atteint le nombre maximal d'avertissement par consequant vous serrez retiré du groupe";
                    await _0x59d506.sendMessage(_0x45f822, {
                      'sticker': fs.readFileSync('st1.webp')
                    }, {
                      'quoted': _0x239233
                    });
                    await _0x59d506.sendMessage(_0x45f822, {
                      'text': _0x36c007,
                      'mentions': [_0x37a424]
                    }, {
                      'quoted': _0x239233
                    });
                    await _0x59d506.groupParticipantsUpdate(_0x45f822, [_0x37a424], "remove");
                    await _0x59d506.sendMessage(_0x45f822, {
                      'delete': _0x5740ad
                    });
                    await fs.unlink("st1.webp");
                  } else {
                    var _0x302e10 = _0x353122 - (_0x24b486 + 0x1);
                    var _0x24c8df = _0x302e10 != 0x0 ? "Lien detecté ;\n passez encore " + _0x302e10 + " avertissement(s) et vous serrez viré du groupe" : "Lien detecté ;\n La prochaine fois sera la bonne";
                    await _0x158c53(_0x37a424);
                    await _0x59d506.sendMessage(_0x45f822, {
                      'text': _0x24c8df,
                      'mentions': [_0x37a424]
                    }, {
                      'quoted': _0x239233
                    });
                    await _0x59d506.sendMessage(_0x45f822, {
                      'delete': _0x5740ad
                    });
                  }
                }
              }
            }
          }
        }
      }
      ;
    }
    const _0x135d41 = _0x239233.key?.['id']?.["startsWith"]("BAES") && _0x239233.key?.['id']?.["length"] === 0x10;
    const _0x4e5644 = _0x239233.key?.['id']?.["startsWith"]('BAE5') && _0x239233.key?.['id']?.["length"] === 0x10;
    const _0x245881 = _0x239233.key?.['id']?.["startsWith"]('3EB0') && _0x239233.key?.['id']?.['length'] >= 0xc;
    if (_0x135d41 || _0x4e5644 || _0x245881) {
      const _0x1a6fd7 = await atbverifierEtatJid(_0x45f822);
      if (_0x1a6fd7) {
        if (_0x384a58 === "reactionMessage") {
          console.log("Je ne reagis pas au reactions");
        } else {
          if (_0x1d2cbf || _0x37a424 === _0x5d8568 || _0x53e9af) {
            console.log("Lien envoyez par un Superuser");
          } else {
            if (!_0x11842f) {
              _0x540c51("J'ai besoin des droits d'administrations pour agire");
            } else {
              const _0x472293 = {
                'remoteJid': _0x45f822,
                'fromMe': false,
                'id': _0x239233.key.id,
                'participant': _0x37a424
              };
              var _0x27027b = "bot détecté, \n";
              var _0xd47402 = await atbrecupererActionJid(_0x45f822);
              if (_0xd47402 === "retirer") {
                try {
                  var _0x1b6cb1 = new Sticker('https://raw.githubusercontent.com/djalega8000/Zokou-MD/main/media/remover.gif', {
                    'pack': "Zoou-Md",
                    'author': conf.NOM_OWNER,
                    'type': StickerTypes.FULL,
                    'categories': ['🤩', '🎉'],
                    'id': '12345',
                    'quality': 0x32,
                    'background': '#000000'
                  });
                  await _0x1b6cb1.toFile("st1.webp");
                  _0x27027b += "message supprimé \n @" + _0x37a424.split('@')[0x0] + " rétiré du groupe.";
                  await _0x59d506.sendMessage(_0x45f822, {
                    'sticker': fs.readFileSync("st1.webp")
                  }, {
                    'quoted': _0x239233
                  });
                  0x0;
                  baileys_1.delay(0x320);
                  await _0x59d506.sendMessage(_0x45f822, {
                    'text': _0x27027b,
                    'mentions': [_0x37a424]
                  }, {
                    'quoted': _0x239233
                  });
                  await _0x59d506.groupParticipantsUpdate(_0x45f822, [_0x37a424], "remove");
                  await _0x59d506.sendMessage(_0x45f822, {
                    'delete': _0x472293
                  });
                  await fs.unlink('st1.webp');
                } catch (_0xaf4e1e) {
                  console.log("antibot " + _0xaf4e1e);
                }
              } else {
                if (_0xd47402 === "supp") {
                  _0x27027b += "message supprimé \n @" + _0x37a424.split('@')[0x0] + " veillez eviter d'utiliser des bots.";
                  await _0x59d506.sendMessage(_0x45f822, {
                    'text': _0x27027b,
                    'mentions': [_0x37a424]
                  }, {
                    'quoted': _0x239233
                  });
                  await _0x59d506.sendMessage(_0x45f822, {
                    'delete': _0x472293
                  });
                } else {
                  if (_0xd47402 === "warn") {
                    const {
                      getWarnCountByJID: _0x2c272a,
                      ajouterUtilisateurAvecWarnCount: _0x5085d2
                    } = require("./bdd/warn");
                    let _0x1e97a4 = await _0x2c272a(_0x37a424);
                    let _0x3f9579 = conf.WARN_COUNT;
                    if (_0x1e97a4 >= _0x3f9579) {
                      var _0x1b6cb1 = new Sticker("https://raw.githubusercontent.com/djalega8000/Zokou-MD/main/media/remover.gif", {
                        'pack': 'Zoou-Md',
                        'author': conf.NOM_OWNER,
                        'type': StickerTypes.FULL,
                        'categories': ['🤩', '🎉'],
                        'id': '12345',
                        'quality': 0x32,
                        'background': "#000000"
                      });
                      await _0x1b6cb1.toFile("st1.webp");
                      var _0x36c007 = "bot detecté ; vous avez atteint le nombre maximal d'avertissement par consequant vous serrez retiré du groupe";
                      await _0x59d506.sendMessage(_0x45f822, {
                        'sticker': fs.readFileSync('st1.webp')
                      }, {
                        'quoted': _0x239233
                      });
                      await _0x59d506.sendMessage(_0x45f822, {
                        'text': _0x36c007,
                        'mentions': [_0x37a424]
                      }, {
                        'quoted': _0x239233
                      });
                      await _0x59d506.groupParticipantsUpdate(_0x45f822, [_0x37a424], "remove");
                      await _0x59d506.sendMessage(_0x45f822, {
                        'delete': _0x472293
                      });
                      await fs.unlink('st1.webp');
                    } else {
                      var _0x302e10 = _0x3f9579 - (_0x1e97a4 + 0x1);
                      var _0x24c8df = _0x302e10 != 0x0 ? "bot detecté;\n passez encore " + _0x302e10 + " avertissement(s) et vous serrez viré du groupe" : "bot detecté;\n La prochaine sera la bonne";
                      await _0x5085d2(_0x37a424);
                      await _0x59d506.sendMessage(_0x45f822, {
                        'text': _0x24c8df,
                        'mentions': [_0x37a424]
                      }, {
                        'quoted': _0x239233
                      });
                      await _0x59d506.sendMessage(_0x45f822, {
                        'delete': _0x472293
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    const _0x29d09f = require("./bdd/afk");
    let _0x55afff = await _0x29d09f.getAfkById(0x1);
    if (_0x55afff?.['etat'] == 'on' && _0x239233.key?.["fromMe"]) {
      const _0x5eda97 = _0x239233.key?.['id']?.['startsWith']("BAES") && _0x239233.key?.['id']?.["length"] === 0x10;
      const _0x14e918 = _0x239233.key?.['id']?.["startsWith"]('BAE5') && _0x239233.key?.['id']?.["length"] === 0x10;
      const _0x1592db = _0x239233.key?.['id']?.["startsWith"]('3EB0') && _0x239233.key?.['id']?.["length"] >= 0xc;
      if (_0x5eda97 || _0x14e918 || _0x1592db) {
        console.log("bot message");
      } else if (_0x41edd6.toLocaleLowerCase() == "noafk") {
        await _0x29d09f.changeAfkState(0x1, "off");
        _0x540c51("Afk desactiver!");
      } else {
        _0x540c51("Envoyez *noafk* si vous voulez desactiver l'afk");
      }
    }
    if (_0x239233.message[_0x384a58]?.["contextInfo"]?.["mentionedJid"]?.['includes'](_0x5d8568) && _0x162f10) {
      console.log("Je suis mentionner");
      if (_0x55afff?.["etat"] == 'on') {
        const _0x31e469 = _0x239233.key?.['id']?.["startsWith"]("BAES") && _0x239233.key?.['id']?.["length"] === 0x10;
        const _0x163143 = _0x239233.key?.['id']?.["startsWith"]("BAE5") && _0x239233.key?.['id']?.['length'] === 0x10;
        const _0x271400 = _0x239233.key?.['id']?.["startsWith"]("3EB0") && _0x239233.key?.['id']?.["length"] >= 0xc;
        if (_0x31e469 || _0x163143 || _0x271400) {
          console.log("Bot message");
        } else {
          if (_0x239233.key?.["fromMe"]) {
            console.log("message from me");
          } else if (_0x55afff.lien == "no url") {
            _0x540c51(_0x55afff.message);
          } else {
            _0x59d506.sendMessage(_0x45f822, {
              'image': {
                'url': _0x55afff.lien
              },
              'caption': _0x55afff.message
            }, {
              'caption': _0x239233
            });
          }
        }
      } else {
        if (_0x45f822 !== "120363158701337904@g.us" && _0x37a424 !== _0x5d8568) {
          let _0x46a621 = require("./bdd/mention");
          let _0x247831 = await _0x46a621.recupererToutesLesValeurs();
          let _0x5d5e00 = _0x247831[0x0];
          if (_0x5d5e00.status === 'non') {
            console.log("mention pas actifs");
          } else {
            let _0x49ee3a;
            if (_0x5d5e00.type.toLocaleLowerCase() === 'image') {
              _0x49ee3a = {
                'image': {
                  'url': _0x5d5e00.url
                },
                'caption': _0x5d5e00.message
              };
            } else {
              if (_0x5d5e00.type.toLocaleLowerCase() === "video") {
                _0x49ee3a = {
                  'video': {
                    'url': _0x5d5e00.url
                  },
                  'caption': _0x5d5e00.message
                };
              } else {
                if (_0x5d5e00.type.toLocaleLowerCase() === "sticker") {
                  let _0x343fcc = new Sticker(_0x5d5e00.url, {
                    'pack': conf.NOM_OWNER,
                    'type': StickerTypes.FULL,
                    'categories': ['🤩', '🎉'],
                    'id': "12345",
                    'quality': 0x46,
                    'background': "transparent"
                  });
                  const _0x38d856 = await _0x343fcc.toBuffer();
                  _0x49ee3a = {
                    'sticker': _0x38d856
                  };
                } else if (_0x5d5e00.type.toLocaleLowerCase() === "audio") {
                  _0x49ee3a = {
                    'audio': {
                      'url': _0x5d5e00.url
                    },
                    'mimetype': 'audio/mp4'
                  };
                }
              }
            }
            _0x59d506.sendMessage(_0x45f822, _0x49ee3a, {
              'quoted': _0x239233
            })["catch"](_0x55740c => console.error(_0x55740c));
          }
        }
        ;
      }
    }
    if (_0x45f822.endsWith("@s.whatsapp.net") && _0x37a424 != _0x5d8568) {
      if (_0x55afff?.["etat"] == 'on') {
        if (_0x55afff.lien == "no url") {
          _0x540c51(_0x55afff.message);
        } else {
          _0x59d506.sendMessage(_0x45f822, {
            'image': {
              'url': _0x55afff.lien
            },
            'caption': _0x55afff.message
          }, {
            'caption': _0x239233
          });
        }
      } else {
        if (conf.CHATBOT === "oui") {
          if (!_0x1ce3d7) {
            const _0x131828 = require("./framework/traduction");
            let _0x5ac608 = await _0x131828(_0x41edd6, {
              'to': 'en'
            });
            fetch('http://api.brainshop.ai/get?bid=177607&key=NwzhALqeO1kubFVD&uid=[uid]&msg=' + _0x5ac608).then(_0x334dd3 => _0x334dd3.json()).then(_0x37159c => {
              const _0x27df22 = _0x37159c.cnt;
              _0x131828(_0x27df22, {
                'to': 'fr'
              }).then(_0x9f84f9 => {
                _0x540c51(_0x9f84f9);
              })['catch'](_0x3374fc => {
                console.error("Erreur lors de la traduction en français :", _0x3374fc);
              });
            })["catch"](_0x227c33 => {
              console.error("Erreur lors de la requête à BrainShop :", _0x227c33);
            });
          }
          ;
        }
      }
    }
    if (_0x239233.message?.["viewOnceMessage"] || _0x239233.message?.["viewOnceMessageV2"] || _0x239233.message?.['viewOnceMessageV2Extension']) {
      if (conf.ANTI_VV.toLowerCase() == 'oui' && !_0x239233.key.fromMe) {
        let _0x22f840 = _0x239233.message[_0x384a58];
        if (_0x22f840.message.imageMessage) {
          var _0x137307 = await _0x59d506.downloadAndSaveMediaMessage(_0x22f840.message.imageMessage);
          var _0x41edd6 = _0x22f840.message.imageMessage.caption;
          await _0x59d506.sendMessage(_0x5d8568, {
            'image': {
              'url': _0x137307
            },
            'caption': _0x41edd6
          }, {
            'quoted': _0x239233
          });
        } else {
          if (_0x22f840.message.videoMessage) {
            var _0x25e197 = await _0x59d506.downloadAndSaveMediaMessage(_0x22f840.message.videoMessage);
            var _0x41edd6 = _0x22f840.message.videoMessage.caption;
            await _0x59d506.sendMessage(_0x5d8568, {
              'video': {
                'url': _0x25e197
              },
              'caption': _0x41edd6
            }, {
              'quoted': _0x239233
            });
          } else {
            if (_0x22f840.message.audioMessage) {
              var _0xb2c2a3 = await _0x59d506.downloadAndSaveMediaMessage(_0x22f840.message.audioMessage);
              await _0x59d506.sendMessage(_0x5d8568, {
                'audio': {
                  'url': _0xb2c2a3
                },
                'mymetype': "audio/mp4"
              }, {
                'quoted': _0x239233,
                'ptt': false
              });
            }
          }
        }
      }
      ;
    }
    if (_0x239233.message?.["imageMessage"] || _0x239233.message?.["audioMessage"] || _0x239233.message?.["videoMessage"] || _0x239233.message?.["stickerMessage"] || _0x239233.message?.["documentMessage"]) {
      let _0x125c62;
      if (dbCache.has("antispam")) {
        _0x125c62 = dbCache.get("antispam").includes(_0x45f822);
      } else {
        let _0x46677b = await isGroupspam();
        _0x125c62 = _0x46677b.includes(_0x45f822);
        dbCache.set('antispam', _0x46677b);
      }
      if (_0x162f10 && _0x125c62 && !_0x53e9af) {
        console.warn("------------------Media------sent--------------------");
        let _0x13e219 = _0x56519c.get(_0x37a424 + '_' + _0x45f822);
        if (_0x13e219) {
          if (_0x13e219.length >= 0x4) {
            _0x13e219.push(_0x239233.key);
            _0x13e219.forEach(_0x1ba925 => {
              _0x59d506.sendMessage(_0x45f822, {
                'delete': _0x1ba925
              });
            });
            _0x59d506.groupParticipantsUpdate(_0x45f822, [_0x37a424], "remove").then(_0x98d68b => {
              _0x59d506.sendMessage(_0x45f822, {
                'text': '@' + _0x37a424.split('@')[0x0] + " a ete retirer pour spam",
                'mentions': [_0x37a424]
              });
            })["catch"](_0x210fb3 => console.log(_0x210fb3));
          } else {
            _0x13e219.push(_0x239233.key);
            _0x56519c.set(_0x37a424 + '_' + _0x45f822, _0x13e219, 0x78);
          }
        } else {
          _0x56519c.set(_0x37a424 + '_' + _0x45f822, [_0x239233.key]);
        }
      }
    }
  });
  _0x59d506.ev.on("group-participants.update", async _0x16ca7b => {
    const _0x2bcae6 = _0x374d1b => {
      if (!_0x374d1b) {
        return _0x374d1b;
      }
      if (/:\d+@/gi.test(_0x374d1b)) {
        0x0;
        let _0x206c57 = baileys_1.jidDecode(_0x374d1b) || {};
        return _0x206c57.user && _0x206c57.server && _0x206c57.user + '@' + _0x206c57.server || _0x374d1b;
      } else {
        return _0x374d1b;
      }
    };
    console.log(_0x16ca7b);
    let _0x11c91b;
    try {
      _0x11c91b = await _0x59d506.profilePictureUrl(_0x16ca7b.id, "image");
    } catch {
      _0x11c91b = "https://telegra.ph/file/4cc2712eee93c105f6739.jpg";
    }
    try {
      const _0x5bfcc2 = await _0x59d506.groupMetadata(_0x16ca7b.id);
      groupMetadataCache.set(_0x16ca7b.id, _0x5bfcc2);
      if (_0x16ca7b.action == 'add' && (await recupevents(_0x16ca7b.id, 'welcome')) == "oui") {
        let _0x28c88e = "╔════◇◇◇═════╗\n║ Souhaitons la bienvenue au(x) nouveau(x) membre(s)\n║ *Nouveau(x) Membre(s) :*\n";
        let _0x3c628c = _0x16ca7b.participants;
        for (let _0x12eb6d of _0x3c628c) {
          _0x28c88e += "║ @" + _0x12eb6d.split('@')[0x0] + "\n";
        }
        _0x28c88e += "║\n╚════◇◇◇═════╝\n◇ *Description*   ◇\n\n" + _0x5bfcc2.desc;
        _0x59d506.sendMessage(_0x16ca7b.id, {
          'image': {
            'url': _0x11c91b
          },
          'caption': _0x28c88e,
          'mentions': _0x3c628c
        });
      } else {
        if (_0x16ca7b.action == "remove" && (await recupevents(_0x16ca7b.id, "goodbye")) == 'oui') {
          let _0x2202bd = "Un ou des membres vient(nent) de quitter le groupe;\n";
          let _0x29dd9c = _0x16ca7b.participants;
          for (let _0x2f636a of _0x29dd9c) {
            _0x2202bd += '@' + _0x2f636a.split('@')[0x0] + "\n";
          }
          _0x59d506.sendMessage(_0x16ca7b.id, {
            'text': _0x2202bd,
            'mentions': _0x29dd9c
          });
        } else {
          if (_0x16ca7b.action == "promote" && (await recupevents(_0x16ca7b.id, "antipromote")) == "oui") {
            if (_0x16ca7b.author == _0x5bfcc2.owner || _0x16ca7b.author == conf.NUMERO_OWNER + "@s.whatsapp.net" || _0x16ca7b.author == _0x2bcae6(_0x59d506.user.id) || _0x16ca7b.author == _0x16ca7b.participants[0x0]) {
              console.log("Cas de superUser je fais rien");
              return;
            }
            ;
            await _0x59d506.groupParticipantsUpdate(_0x16ca7b.id, [_0x16ca7b.author, _0x16ca7b.participants[0x0]], "demote");
            _0x59d506.sendMessage(_0x16ca7b.id, {
              'text': '@' + _0x16ca7b.author.split('@')[0x0] + " a enfreinst la règle de l'antipromote par consequent lui et @" + _0x16ca7b.participants[0x0].split('@')[0x0] + " ont été demis des droits d'aministration",
              'mentions': [_0x16ca7b.author, _0x16ca7b.participants[0x0]]
            });
          } else {
            if (_0x16ca7b.action == "demote" && (await recupevents(_0x16ca7b.id, "antidemote")) == "oui") {
              if (_0x16ca7b.author == _0x5bfcc2.owner || _0x16ca7b.author == conf.NUMERO_OWNER + "@s.whatsapp.net" || _0x16ca7b.author == _0x2bcae6(_0x59d506.user.id) || _0x16ca7b.author == _0x16ca7b.participants[0x0]) {
                console.log("Cas de superUser je fais rien");
                return;
              }
              ;
              await _0x59d506.groupParticipantsUpdate(_0x16ca7b.id, [_0x16ca7b.author], "demote");
              await _0x59d506.groupParticipantsUpdate(_0x16ca7b.id, [_0x16ca7b.participants[0x0]], "promote");
              _0x59d506.sendMessage(_0x16ca7b.id, {
                'text': '@' + _0x16ca7b.author.split('@')[0x0] + " a enfreint la règle de l'antidemote car il a denommer @" + _0x16ca7b.participants[0x0].split('@')[0x0] + " par consequent , il est demit des droits d'aministration",
                'mentions': [_0x16ca7b.author, _0x16ca7b.participants[0x0]]
              });
            }
          }
        }
      }
    } catch (_0x1f97ea) {
      console.error(_0x1f97ea);
    }
  });
  _0x59d506.ev.on("group.update", async _0x58b311 => {
    groupMetadataCache.set(_0x58b311.id, _0x58b311);
  });
  _0x59d506.ev.on("contacts.upsert", async _0x11b0ae => {
    const _0x519214 = _0x4b524e => {
      for (const _0x5a4f06 of _0x4b524e) {
        if (store.contacts[_0x5a4f06.id]) {
          Object.assign(store.contacts[_0x5a4f06.id], _0x5a4f06);
        } else {
          store.contacts[_0x5a4f06.id] = _0x5a4f06;
        }
      }
      return;
    };
    _0x519214(_0x11b0ae);
  });
  _0x59d506.ev.on("connection.update", async _0x47fddb => {
    const {
      connection: _0x1172e4,
      lastDisconnect: _0x3e9f6f,
      receivedPendingNotifications: _0x4c0d41
    } = _0x47fddb;
    if (_0x1172e4 == "connecting") {
      console.log("connection en cours...");
    } else {
      if (_0x1172e4 == "close") {
        let _0x37b24f = new Boom(_0x3e9f6f?.["error"])?.["output"]["statusCode"];
        if (_0x37b24f == DisconnectReason.connectionClosed) {
          console.log("Connexion fermee , reconnexion en cours");
          connectToWhatsapp();
        } else {
          if (_0x37b24f == DisconnectReason.badSession) {
            console.log("La session id est erronee,  veillez la remplacer");
          } else {
            if (_0x37b24f === DisconnectReason.connectionReplaced) {
              console.log("connexion réplacée ,,, une session est déjà ouverte veuillez la fermer svp !!!");
            } else {
              if (_0x37b24f === DisconnectReason.loggedOut) {
                console.log("vous êtes déconnecté,,, veuillez rescanner le code qr svp");
              } else {
                if (_0x37b24f === DisconnectReason.restartRequired) {
                  console.log("redémarrage en cours ▶️");
                  connectToWhatsapp();
                } else {
                  if (_0x37b24f === DisconnectReason.connectionLost) {
                    console.log("connexion au serveur perdue 😞 ,,, reconnexion en cours ... ");
                    connectToWhatsapp();
                  } else {
                    console.log("Raison de deconnection inattendue ; redemarrage du server");
                    const {
                      exec: _0x94423a
                    } = require("child_process");
                    _0x94423a("pm2 restart all");
                  }
                }
              }
            }
          }
        }
      } else {
        if (_0x1172e4 == "open") {
          console.log("✅ connexion reussie! ☺️");
          await delay(0x1f4);
          fs.readdirSync(__dirname + "/commandes").forEach(_0x50795a => {
            if (path.extname(_0x50795a).toLowerCase() == '.js') {
              try {
                require(__dirname + '/commandes/' + _0x50795a);
                console.log(_0x50795a + " installé ✔️");
              } catch (_0x10d700) {
                console.log(_0x50795a + " n'a pas pu être chargé pour les raisons suivantes : " + _0x10d700);
              }
              delay(0x12c);
            }
          });
          await delay(0x2bc);
          var _0x160598;
          if (conf.MODE.toLowerCase() === "oui") {
            _0x160598 = "public";
          } else if (conf.MODE.toLowerCase() === "non") {
            _0x160598 = "privé";
          } else {
            _0x160598 = "indéfini";
          }
          console.log("chargement des commandes terminé ✅");
          await _0x5872e4();
          if (conf.DP.toLowerCase() === "oui") {
            let _0x3a4c5e = "╔════◇\n║ 『𝐙𝐨𝐤𝐨𝐮-𝐌𝐃』\n║    Prefix : [ " + prefixe + " ]\n║    Mode :" + _0x160598 + "\n║    Nombre total de Commandes : " + evt.cm.length + "︎\n╚══════════════════╝\n  \n╔═════◇\n║『𝗯𝘆 Djalega++』\n║ \n╚══════════════════╝";
            await _0x59d506.sendMessage(_0x59d506.user.id, {
              'text': _0x3a4c5e
            });
          }
        }
      }
    }
  });
  _0x59d506.ev.on('creds.update', _0x5e160c);
  _0x59d506.downloadAndSaveMediaMessage = async (_0x46a055, _0x304927 = '', _0x24ed1b = true) => {
    let _0x1e8ef4 = _0x46a055.msg ? _0x46a055.msg : _0x46a055;
    let _0x250d59 = (_0x46a055.msg || _0x46a055).mimetype || '';
    let _0x24eea7 = _0x46a055.mtype ? _0x46a055.mtype.replace(/Message/gi, '') : _0x250d59.split('/')[0x0];
    const _0x3bc346 = await downloadContentFromMessage(_0x1e8ef4, _0x24eea7);
    let _0x258429 = Buffer.from([]);
    for await (const _0x3b6e48 of _0x3bc346) {
      _0x258429 = Buffer.concat([_0x258429, _0x3b6e48]);
    }
    let _0x36b5c7 = await FileType.fromBuffer(_0x258429);
    let _0x3835f4 = './' + _0x304927 + '.' + _0x36b5c7.ext;
    await fs.writeFileSync(_0x3835f4, _0x258429);
    return _0x3835f4;
  };
  _0x59d506.awaitForMessage = async (_0x12aa29 = {}) => {
    return new Promise((_0x286f8c, _0x4e197e) => {
      if (typeof _0x12aa29 !== "object") {
        _0x4e197e(new Error("Options must be an object"));
      }
      if (typeof _0x12aa29.sender !== 'string') {
        _0x4e197e(new Error("Sender must be a string"));
      }
      if (typeof _0x12aa29.chatJid !== "string") {
        _0x4e197e(new Error("ChatJid must be a string"));
      }
      if (_0x12aa29.timeout && typeof _0x12aa29.timeout !== "number") {
        _0x4e197e(new Error("Timeout must be a number"));
      }
      if (_0x12aa29.filter && typeof _0x12aa29.filter !== "function") {
        _0x4e197e(new Error("Filter must be a function"));
      }
      const _0x52b1ba = _0x12aa29?.["timeout"] || undefined;
      const _0x2a69cd = _0x12aa29?.["filter"] || (() => true);
      let _0x5aa6e5 = undefined;
      let _0x57f1fc = _0x23a321 => {
        let {
          type: _0x570402,
          messages: _0x2047eb
        } = _0x23a321;
        if (_0x570402 == "notify") {
          for (let _0x4fbc59 of _0x2047eb) {
            const _0x43be42 = _0x4fbc59.key.fromMe;
            const _0x1d6c7c = _0x4fbc59.key.remoteJid;
            const _0x3b1ad1 = _0x1d6c7c.endsWith("@g.us");
            const _0x1a9398 = _0x1d6c7c == "status@broadcast";
            const _0x68f65 = _0x43be42 ? _0x59d506.user.id.replace(/:.*@/g, '@') : _0x3b1ad1 || _0x1a9398 ? _0x4fbc59.key.participant.replace(/:.*@/g, '@') : _0x1d6c7c;
            if (_0x68f65 == _0x12aa29.sender && _0x1d6c7c == _0x12aa29.chatJid && _0x2a69cd(_0x4fbc59)) {
              _0x59d506.ev.off("messages.upsert", _0x57f1fc);
              clearTimeout(_0x5aa6e5);
              _0x286f8c(_0x4fbc59);
            }
          }
        }
      };
      _0x59d506.ev.on("messages.upsert", _0x57f1fc);
      if (_0x52b1ba) {
        _0x5aa6e5 = setTimeout(() => {
          _0x59d506.ev.off("messages.upsert", _0x57f1fc);
          _0x4e197e(new Error("Timeout"));
        }, _0x52b1ba);
      }
    });
  };
  async function _0x5872e4() {
    const _0x375c60 = require("node-cron");
    const {
      getCron: _0x3cf7ef
    } = require("./bdd/cron");
    let _0x54d53a = await _0x3cf7ef();
    console.log(_0x54d53a);
    if (_0x54d53a.length > 0x0) {
      for (let _0x2ddc77 = 0x0; _0x2ddc77 < _0x54d53a.length; _0x2ddc77++) {
        if (_0x54d53a[_0x2ddc77].mute_at != null) {
          let _0x245fb1 = _0x54d53a[_0x2ddc77].mute_at.split(':');
          console.log("etablissement d'un automute pour " + _0x54d53a[_0x2ddc77].group_id + " a " + _0x245fb1[0x0] + " H " + _0x245fb1[0x1]);
          _0x375c60.schedule(_0x245fb1[0x1] + " " + _0x245fb1[0x0] + " * * *", async () => {
            try {
              await _0x59d506.groupSettingUpdate(_0x54d53a[_0x2ddc77].group_id, "announcement");
              _0x59d506.sendMessage(_0x54d53a[_0x2ddc77].group_id, {
                'image': {
                  'url': "./media/chrono.jpg"
                },
                'caption': "Tic Tac, les discussions passionnantes touchent à leur fin. Nous vous remercions pour votre participation active ; maintenant, c'est l'heure de fermer le groupe pour aujourd'hui."
              });
            } catch (_0x629f62) {
              console.log(_0x629f62);
            }
          }, {
            'timezone': 'Africa/Abidjan'
          });
        }
        if (_0x54d53a[_0x2ddc77].unmute_at != null) {
          let _0x47ee29 = _0x54d53a[_0x2ddc77].unmute_at.split(':');
          console.log("etablissement d'un autounmute pour " + _0x47ee29[0x0] + " H " + _0x47ee29[0x1] + " ");
          _0x375c60.schedule(_0x47ee29[0x1] + " " + _0x47ee29[0x0] + " * * *", async () => {
            try {
              await _0x59d506.groupSettingUpdate(_0x54d53a[_0x2ddc77].group_id, "not_announcement");
              _0x59d506.sendMessage(_0x54d53a[_0x2ddc77].group_id, {
                'image': {
                  'url': './media/chrono.jpg'
                },
                'caption': "C'est l'heure d'ouvrir les portes de notre  groupe ! Bienvenue à tous dans cette communauté passionnante où nous partageons et apprenons ensemble."
              });
            } catch (_0x44d5d5) {
              console.log(_0x44d5d5);
            }
          }, {
            'timezone': 'Africa/Abidjan'
          });
        }
      }
    } else {
      console.log("Les crons n'ont pas été activés");
    }
    return;
  }
}
connectToWhatsapp();
