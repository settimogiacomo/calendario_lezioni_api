const express = require('express');
const cors = require('cors');
const app = express();
const port = 3005;

app.use(cors({
    origin: '*'
}));

app.get('/',(req,res) => {
    console.log("prova in json")
    res.json({messaggio:'ciao'});
})

app.get('/check-login',(req,res) => {
    //TODO query al db
    //controlla che esistano nome e pwd
    //dovrebbe diventare una post
    console.log("check-login")
    res.status(200).json({isUser:'true'});
})

app.listen(port, () => console.log('Server in ascolto'));

