const functions = require('firebase-functions');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const Twitter = require('./api/helpers/twitter');
const twitter = new Twitter();
require('dotenv').config();

//use middleware to enable cors for all users
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/tweets', (req, res) => {
  const query = req.query.q;
  const count = req.query.count;
  const maxId = req.query.max_id;
  twitter
    .get(query, count, maxId)
    .then((response) => {
      return res.status(200).send(response.data);
    })
    .catch((error) => {
      return res.status(400).send(error);
    });
});

app.get('/trends', (req, res) => {
  const id = req.query.id;
  twitter
    .getTrends(id)
    .then((response) => {
      return res.status(200).send(response.data);
    })
    .catch((error) => {
      return res.status(400).send(error);
    });
});

exports.api = functions.https.onRequest(app);
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
