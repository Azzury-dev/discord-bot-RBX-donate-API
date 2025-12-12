import fs from "fs";
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import puppeteer from "puppeteer";

import fetch from "node-fetch";
import FormData from "form-data";

const webhookUrl = "";

const app = express();
app.use(bodyParser.json());

app.post("/donation", async (req, res) => {
  const { giver, receiver, amount, type } = req.body;

  try {
    const gThumb = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${giver.userId}&size=180x180&format=Png&isCircular=false`;
    const rThumb = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${receiver.userId}&size=180x180&format=Png&isCircular=false`;

    const gRes = await fetch(gThumb);
    const gJson = await gRes.json();
    const giverAvatar = gJson.data[0].imageUrl;

    const rRes = await fetch(rThumb);
    const rJson = await rRes.json();
    const receiverAvatar = rJson.data[0].imageUrl;

    const centerImage =
        type === "gift"
            ? "https://cdn.discordapp.com/attachments/1425617532420886538/1425632632900685915/214305.png"
            : "https://cdn.discordapp.com/attachments/1425617532420886538/1425632529347772437/706px-Robux_2019_Logo_gold.png";

    const htmlPath = path.join(__dirname, "templates", "donation.html");
    let html = fs.readFileSync(htmlPath, "utf8");

    html = html
      .replace("{{giverName}}", giver.name)
      .replace("{{receiverName}}", receiver.name)
      .replace("{{receiverDisplay}}", receiver.display)
      .replace("{{giverDisplay}}", giver.display)
      .replace("{{giverAvatar}}", giverAvatar)
      .replace("{{receiverAvatar}}", receiverAvatar)
      .replace("{{amount}}", amount)
      .replace("{{type}}", type === "gift" ? "Gift to" : "Donated to")
      .replaceAll("{{centerImage}}", centerImage);

    const browser = await puppeteer.launch({ 
        headless: true,
        args: ["--no-sandbox"],
        executablePath: "/usr/bin/chromium",
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const buffer = await page.screenshot({ type: "png", omitBackground: true, clip: { x: 0, y: 0, width: 900, height: 350 } });
    await browser.close();

    const formData = new FormData();
    formData.append("file", buffer, "donation.png");
    formData.append(
      "payload_json",
      JSON.stringify({
        username: "Donation Tracker",
        content: "",
      })
    );

    await fetch(webhookUrl, { method: "POST", body: formData });
    res.send("ok");
  } catch (err) {
    console.error("❌ Erreur /donation:", err);
    res.status(500).send(err.message);
  }
});

app.listen(3000, '0.0.0.0', () => console.log('API running on port 3000'))