const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const app = express();
const port = 3005;

app.use(cors({
    origin: '*' //'http://localhost:XXXX' indirizzo flutter
}));

//the encoding of the request (post) Contet-Type: application/json
app.use(bodyParser.json())

app.get('/',(req,res) => {
    console.log("prova in json")
    res.json({messaggio:'ciao'});
})

app.get('/check-login',(req,res) => {
    //TODO query al db
    //controlla che esistano nome e pwd
    //TODO fare una post 
    console.log("GET check-login")
    res.status(200).json({isUser:'true'});
})

app.post('/prova-post', (req, res) => {
    console.log("POST feedback")
    res.status(200).json({feedback:'true'})
})

app.get('/lista', (req, res) => {
    console.log("GET json cibo")
    var cibo = {
        noodles: "pollo",
        pizza: "margherita",
        panettone: "esotico"
    }

    res.setHeader('Content-Type', 'application/json')
    res.status(200)
    res.json(cibo)
})

app.get('/select', (req, res) => {
    console.log("GET select regali")
    let dati = ""
    //TODO query = "SELECT * FROM regali"
    res.setHeader('Content-Type', 'application/json')
    res.status(200)
    res.json(dati)
})
app.listen(port, () => console.log('Server in ascolto'));

