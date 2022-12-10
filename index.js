
require('./costanti.js')();

const express = require('express');
const cors = require('cors');
const mysql = require('mysql')
const bodyParser = require('body-parser')
const app = express();
const port = 3005;
const conn = mysql.createConnection({
    host: HOST,
    user: USER,
    password: PASS,
    database: NOME_DB
})



conn.connect()
app.use(cors({
    origin: '*' //'http://localhost' indirizzo flutter
}));

//the encoding of the request (post) Contet-Type: application/json
app.use(bodyParser.json())

app.get('/',(req,res) => {
    console.log("prova in json")
    res.json({messaggio:'ciao'});
})

app.post('/check-login',(req,res) => {
    var body = req.body

    try{
        conn.query('SELECT * FROM utenti WHERE username = "' + body.user + '"', (err, rows, fields) => {
            //if (err) throw err
            if (err){
                res.json({ isUser: 'false' })
            } else {
                if(rows.length >= 1){
                    if(body.password == rows[0].password){
                        res.json({ isUser: 'true' })
                    } else {
                        res.json({ isUser: 'false' })
                    }
                } else {
                    res.json({ isUser: 'false' })
                }
                
            }
            
        })
    } catch(errore) {
        res.json ({isUser:'false', debug:errore})
    }
    
    console.log("POST check-login")
    res.status(200);
    
})


app.get('/get-lezioni',(req,res) => {
    var body = req.body

    try{
        conn.query('SELECT * FROM lista_lezioni', (err, rows, fields) => {
            //if (err) throw err
            if (err){
                res.json({ isTable: 'false' })
            } else {
               
                if(rows.length >= 1){
                    var result = [];
                        for (let i=0;i<rows.length;i++) {
                            result.push({id_lezione: rows[i].id_lezione, id_insegnante: rows[i].id_insegnante, id_studente: rows[i].id_studente,inizio_lezione: rows[i].inizio_lezione,fine_lezione: rows[i].fine_lezione,stato: rows[i].stato});
                        
                        }
                        console.log(result)
                        res.json({isTable:'True', data:result })
                        
                } else {
                    res.json({ isTable: 'false' })
                }
                
            }
            
        })
    } catch(errore) {
        res.json ({isTable:'false', debug:errore})
    }
    
    console.log("GET get-lezioni")
    res.status(200);
    
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

