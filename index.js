require("dotenv").config();
const { Client, Events, GatewayIntentBits } = require("discord.js");
const express = require("express");
const path = require("path");
const app = new express();
const cheerio = require("cheerio");
const fs = require("fs");
const gid = "1077237771720216647";
const token = process.env.TOKEN;
app.use(express.json());
const loggingIn = {};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}`);
});

async function userPresence(guildId, userId) {
  try {
    const guild = await client.guilds.fetch(guildId);
    if (!guild) {
      return;
    }

    const member = await guild.members.fetch({ user: userId, force: true });
    if (!member) {
      return;
    }

    return member.presence;
  } catch (error) {
    console.error("Error fetching member presence:", error);
  }
}

client.login(token);
app.use(express.static(path.join(__dirname, "site/js/")));
app.use(express.static(path.join(__dirname, "site/css/")));
app.use(express.static(path.join(__dirname, "site/media/")));
app.use(
  express.static(path.join(__dirname, "site/html/"), {
    extensions: ["html"],
  })
);

app.get("/api/:uid/status", async (req, res) => {
  const uid = req.params.uid;
  const awUsers = JSON.parse(
    fs.readFileSync(path.join(__dirname, "site/js/users.json"), "utf-8")
  );
  if (awUsers[id]) {
    const uid = awUsers[uid].id;
    const status = await userPresence(gid, uid);
    res.json(status);
  } else {
    res.status(404).json({ error: "User Not Found" });
  }
});

app.get("/api/:uid/login", async (req, res) => {
  const uid = req.params.uid;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  let code = "";
  for (let i = 0; i++, i < 7; ) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  const msg = await confirmUID(uid, code);
  if (msg.error) {
    res.status(msg.status).json(msg);
  } else {
    res.status(200).send("Successful");
    loggingIn[uid] = code;
    setTimeout(() => {
      if (loggingIn[uid] == code) {
        delete loggingIn[uid];
      }
    }, 300000);
  }
});

app.get("/api/:uid/confirm", async (req, res) => {
  const uid = req.params.uid;
  const code = req.query.code;
  if (loggingIn[uid] == code) {
    res.status(200).send("Successful");
    delete loggingIn[uid];
  } else {
    res.status(403).json({ error: "Invalid confirmation code", status: 403 });
  }
});

app.get("/:id", async (req, res) => {
  const id = req.params.id;
  const awUsers = JSON.parse(
    fs.readFileSync(path.join(__dirname, "site/js/users.json"), "utf-8")
  );
  if (awUsers[id]) {
    let awUser = awUsers[id];
    let user = await client.users.fetch(awUser.id);
    user.awData = awUsers[id];
    const $ = cheerio.load(
      fs.readFileSync(path.join(__dirname, "site/html/user.html"), "utf-8")
    );
    const pfp = $("#pfp");
    const name = $("#dname");
    const bio = $("#bio");
    const icons = $("#icons");
    $("head").append(
      `<meta property='og:title' content='${user.globalName}'/>`
    );
    $("head").append(
      `<meta property='og:image' content='${user.avatarURL()}' />`
    );
    $("head").append(
      `<meta property='og:description' content='${user.awData.bio}'/>`
    );
    $("head").append(`<awid>${id}</awid>`);
    $("head").append(`<title>${user.globalName}</title>`);
    $("html").css("background-image", `url(${user.awData.background})`);
    pfp.attr("src", user.avatarURL());
    name.text(user.globalName);
    bio.text(user.awData.bio);
    user.awData.links.forEach((link) => {
      const a = $("<a></a>");
      const img = $("<img />");
      a.attr("href", link);
      img.attr(
        "src",
        `https://icon.horse/icon/${new URL(link).host}?size=large`
      );
      a.append(img);
      icons.append(a);
    });
    const html = $.html();
    res.send(html);
  } else {
    res.sendFile(path.join(__dirname, "site/html/404.html"));
  }
});

app.listen(3000, () => {
  console.log("Web server started");
});

async function confirmUID(userId, confCode) {
  const user = await client.users.fetch(userId);
  if (!user) return { error: "User not found", status: 404 };
  try {
    user.send(
      `Here is your DiscoWatch! confirmation code: **${confCode}**\nThis code will expire in 5 minutes, use it quick!\n-# (Didn't ask for this code? Ignore it and all will be well :3)`
    );
  } catch (e) {
    return { error: "Failed to send confirmation code", status: 502 };
  }
  return { status: 200 };
}
