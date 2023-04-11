
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
let mongoose=require('mongoose');

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;

const urlSchema = new Schema({
  original_url: {type: String, required: true},
  short_url: { type: Number, required: true }
});

let Url = mongoose.model("Urls", urlSchema);

const originalUrls = [];
const shortUrls = [];

async function getUrls(){

  let urls = await Url.find();

  urls.map(u => (
    originalUrls.push(u.original_url)
  ));
  
}

async function getShortUrls(){

  let urls = await Url.find();

  urls.map(u => (
    shortUrls.push(u.short_url)
  ));
}

getUrls();
getShortUrls();

app.use(cors());

app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});



app.post('/api/shorturl', (req, res, done) => {
  const url = req.body.url;

  const foundIndex = originalUrls.indexOf(url);
  
  const urlRegex = /^(https?:\/\/)(www.)?[A-Za-z]+.[A-Za-z]+/;
  
  if(url.match(urlRegex)) {
    if(foundIndex < 0)
    {
      let newUrl = Url.create({
        original_url: url,
        short_url: shortUrls.length
      });
      originalUrls.push(url);
      shortUrls.push(shortUrls.length);

      

      return res.json({
        original_url: url,
        short_url: shortUrls.length - 1
        });
      
    }
    return res.json({
        original_url: url,
        short_url: shortUrls[foundIndex]
      });
  }
  else {
    return res.json({error: 'invalid url'})
  }
});

app.get('/api/shorturl/:shorturl', (req,res) => {
  const shortUrl = parseInt(req.params.shorturl);
  const foundIndex = shortUrls.indexOf(shortUrl);

  if(foundIndex < 0){
    return res.json({error: 'invalid url'});
  }

  res.redirect(originalUrls[foundIndex]);
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
