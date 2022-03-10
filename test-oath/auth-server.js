
const dotenv = require('dotenv');
dotenv.config({
    path: 'test-oath/.env'
});

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.REACT_APP_CLIENT_ID);

const app = express();

const jsonParser = bodyParser.json();
app.use(jsonParser);

app.use(cors({ origin: true }))

app.post('/api', cors({ origin: true }), async (req, res) => {
    const token = req.body.token;
    console.log(`Received ${token}`);
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.REACT_APP_CLIENT_ID
    });

    const { name, email, picture, sub } = ticket.getPayload();

    res.send({
        yo: 'lets go',
        name,
        email,
        picture
    });
});

app.listen(8000);
