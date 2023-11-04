require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const UrlModel = require("./model").URL;

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", async (req, res, done) => {
  const url = req.body.url;

  const urlRegex = /^(https?:\/\/)(www.)?[A-Za-z]+.[A-Za-z]+/;

  if (url.match(urlRegex)) {
    let urlData = await UrlModel.findOne({ original_url: url });
    if (!urlData) {
      let size = await UrlModel.count();
      let newUrl = await UrlModel.create({
        original_url: url,
        short_url: size,
      });

      return res.json({
        original_url: newUrl.original_url,
        short_url: newUrl.short_url,
      });
    }
  } else {
    return res.json({ error: "invalid url" });
  }
});

app.get("/api/shorturl/:shorturl", async (req, res) => {
  const shortUrl = parseInt(req.params.shorturl);

  let urlData = await UrlModel.findOne({ short_url: shortUrl });

  if (!urlData) {
    return res.json({ error: "invalid url" });
  }

  res.redirect(urlData.original_url);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
