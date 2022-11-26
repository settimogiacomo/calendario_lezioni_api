const express = require('express');
const app = express();
const port = 3005;
app.get('/',(req,res) => {
    res.json({messaggio:'ciao'});
})

app.get('/check-login',(req,res) => {
    //TODO query al db
    //controlla che esistano nome e pwd
    res.status(200).json( {
            isUser:'true'
        }
    );
})

app.listen(port, () => console.log('Prova prova sa sa'));

