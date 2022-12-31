
require('./costanti.js')()

const express = require('express')
const cors = require('cors')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const moment = require('moment')
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
                        let id = rows[0].id_studente
                        res.json({ isUser: 'true', id_studente: id })
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
        conn.query('SELECT * FROM lista_lezioni_vista', (err, rows, fields) => {
            //if (err) throw err
            if (err){
                res.json({ isTable: 'false' })
            } else {
               
                if(rows.length >= 1){
                    var result = [];
                        for (let i=0;i<rows.length;i++) {
                            //parsing datetime
                           // console.log(rows[i].inizio_lezione)
                           // console.log(rows[i].fine_lezione)

                            moment.locale('it')
                            let inizioLezione = moment(rows[i].inizio_lezione).utcOffset(60).format('DD/MM/YYYY, hh:mm A') 
                            let fineLezione = moment(rows[i].fine_lezione).utcOffset(60).format('DD/MM/YYYY, hh:mm A')

                            result.push({ id_lezione: rows[i].id_lezione, id_insegnante: rows[i].id_insegnante, insegnante: rows[i].insegnante, materia: rows[i].materia, id_studente: rows[i].id_studente, username: rows[i].username, inizio_lezione: inizioLezione, fine_lezione: fineLezione, stato: rows[i].stato})
                        }
                       // console.log(result)
                        res.json({isTable:'true', data:result })
                        
                } else {
                    res.json({ isTable: 'false' })
                }
                
            }
            
        })
    } catch(errore) {
        res.json ({isTable:'false', debug:errore})
    }
    
 //   console.log("GET get-lezioni")
    res.status(200);
    
})

app.get('/lezione/:materia',(req,res) => {

    try{
        conn.query('SELECT cs.id_giorno, cs.id_insegnante, im.insegnante, cs.materia, cs.inizio_lezione, cs.fine_lezione, cs.stato FROM calendario_settimana cs JOIN insegnante_materia im ON (im.id_insegnante = cs.id_insegnante) WHERE cs.materia = "' + req.params.materia + '" AND cs.stato =  "0"', (err, rows, fields) => {
            //if (err) throw err
            if (err){
                res.json({ isTable: 'false' })
            } else {
               
                if(rows.length >= 1){
                    var result = [];
                        for (let i=0;i<rows.length;i++) {
                            //parsing datetime
                           // console.log(rows[i].giorno);
                           
                            console.log(rows[i].inizio_lezione)
                            console.log(rows[i].fine_lezione)

                           // moment.locale('it')
                            //let inizioLezione = moment(rows[i].inizio_lezione).utcOffset(60).format('DD/MM/YYYY, hh:mm A') 
                            //let fineLezione = moment(rows[i].fine_lezione).utcOffset(60).format('DD/MM/YYYY, hh:mm A')

                            result.push({ id_giorno: rows[i].id_giorno, id_insegnante: rows[i].id_insegnante, insegnante: rows[i].insegnante, materia: rows[i].materia, inizio_lezione: rows[i].inizio_lezione, fine_lezione: rows[i].fine_lezione, stato: rows[i].stato})
                        }
                        console.log(result)
                        res.json({isTable:'true', data:result })
                        
                } else {
                    res.json({ isTable: 'false' })
                }
                
            }
            
        })
    } catch(errore) {
        res.json ({isTable:'false', debug:errore})
    }
    
   
    
})

app.post('/prenota', (req, res) => {
    var body = req.body

    let day = getGiornoLezione(body.id_giorno)
    moment.locale('it')
    var giorno = moment(day).utcOffset(60).format('YYYY-MM-DD') 

    var query = "INSERT INTO lista_lezioni (id_insegnante, id_studente, inizio_lezione, fine_lezione, stato) VALUES ('" + body.id_insegnante + "', '" + body.id_studente + "', '" + giorno + " " + body.inizio_lezione + "', '" + giorno + " " + body.fine_lezione + "', '1')"
  

    try {
        conn.query(query, (err, rows, fields) => {
            //TODO: query modifica calendario_settimana
            //if (err) throw err
            if (err) {
                res.json({ ok: 'false', debug: err })
            } else {
              //res.json({ ok: 'true' })

              var query2 = "UPDATE calendario_settimana SET stato = 1 WHERE  id_giorno = '" + body.id_giorno + "' AND id_insegnante = '" + body.id_insegnante+"' AND inizio_lezione  = '" + body.inizio_lezione +"' "

              conn.query(query2, (err, rows, fields) => {
                if (err) {
                    res.json({ ok: 'false', debug: err })
                } else {
                    res.json({ ok: 'true' })
                }
            })
            }

        })
    } catch (errore) {
        res.json({ ok: 'false', debug: errore })
    } 


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

//TODO: spostare 
function getGiornoLezione(giornoDellaLezione){
    var today = new Date()
    if (today.getDay() == 5 || today.getDay() == 6 || today.getDay() == 0){
        today.setDate(today.getDate() + 7);
    }
    var domenica = today.getDate() - today.getDay()
    let giornoLezione = domenica + giornoDellaLezione
    let dataLezione = new Date(today.setDate(giornoLezione))
    return dataLezione
}

