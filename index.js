
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


app.get('/get-lezioni/:id_studente',(req,res) => {
    var body = req.body

    try{
        conn.query('SELECT * FROM lista_lezioni_vista WHERE id_studente = "' + req.params.id_studente + '" ORDER BY id_lezione DESC', (err, rows, fields) => {
            
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

                            result.push({ id_lezione: rows[i].id_lezione, id_insegnante: rows[i].id_insegnante, insegnante: rows[i].insegnante, materia: rows[i].materia, id_studente: rows[i].id_studente, username: rows[i].username, inizio_lezione: inizioLezione, fine_lezione: fineLezione, stato: rows[i].stato, cod_lezione: rows[i].cod_lezione })
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
    
    console.log("GET get-lezioni")
    res.status(200);
    
})

app.get('/lezione/:materia',(req,res) => {

    var today = new Date()
    var id_today = today.getDay()
    var ora = today.getHours()
    var ora_inizio = ""
    if (today.getDay() !== 6 && today.getDay() !== 0 && today.getHours() <= 18){
        ora_inizio =" AND cs.inizio_lezione >= '" + ora + ":00'"
    }


    try{
        conn.query('SELECT cs.cod_lezione, cs.id_giorno, cs.id_insegnante, im.insegnante, cs.materia, cs.inizio_lezione, cs.fine_lezione, cs.stato FROM calendario_settimana cs JOIN insegnante_materia im ON (im.id_insegnante = cs.id_insegnante) WHERE cs.materia = "' + req.params.materia + '" AND cs.stato =  "0" '
            + 'AND cs.id_giorno >= ' + id_today + ora_inizio, //filtro giorno e ora
        (err, rows, fields) => {
            //if (err) throw err
            if (err){
                res.json({ isTable: 'false' })
            } else {
               
                if(rows.length >= 1){
                    var result = [];
                        for (let i=0;i<rows.length;i++) {

                            result.push({ cod_lezione: rows[i].cod_lezione, id_giorno: rows[i].id_giorno, id_insegnante: rows[i].id_insegnante, insegnante: rows[i].insegnante, materia: rows[i].materia, inizio_lezione: rows[i].inizio_lezione, fine_lezione: rows[i].fine_lezione, stato: rows[i].stato})
                        }
                        res.json({isTable:'true', data:result })
                        
                } else {
                    res.json({ isTable: 'false' })
                }
                
            }
            
        })
    } catch(errore) {
        res.json ({isTable:'false', debug:errore})
    }

    console.log("GET lezione")
    
   
    
})

app.post('/prenota', (req, res) => {
    var body = req.body

    console.log("body:" +  body)
    let day = getGiornoLezione(body.id_giorno)
    console.log("day:" + day)
    moment.locale('it')
    var giorno = moment(day).utcOffset(60).format('YYYY-MM-DD') 
    console.log("goorno:" +  giorno)

    var query = "INSERT INTO lista_lezioni (id_insegnante, id_studente, inizio_lezione, fine_lezione, stato, cod_lezione) VALUES ('" + body.id_insegnante + "', '" + body.id_studente + "', '" + giorno + " " + body.inizio_lezione + "', '" + giorno + " " + body.fine_lezione + "', '1', '" + body.cod_lezione + "')"
  

    try {
        conn.query(query, (err, rows, fields) => {
            //if (err) throw err
            if (err) {
                res.json({ ok: 'false', debug: err })
            } else {
              //res.json({ ok: 'true' })

                var query2 = "UPDATE calendario_settimana SET stato = 1 WHERE cod_lezione = '" + body.cod_lezione + "'"

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
    console.log("GET prenota")


})

app.get('/operazione/:id_lezione_cod_lezione/:tipologia', (req, res) => {
    
var array_split = req.params.id_lezione_cod_lezione.split("+")
var id_lezione = array_split[0] 
var cod_lezione = array_split[1]


    try {
        conn.query('UPDATE lista_lezioni SET stato = '+ req.params.tipologia +' WHERE id_lezione = ' + id_lezione, (err, rows, fields) => {
            //if (err) throw err
            if (err) {
                res.json({ ok: 'false' })
            } else {

                var query2 = 'UPDATE calendario_settimana SET stato = '+ req.params.tipologia +' WHERE cod_lezione = ' + cod_lezione

                conn.query(query2, (err, rows, fields) => {
                    if (err) {
                        res.json({ ok: 'false', debug: err })
                    } else {
                        if (req.params.tipologia == 2) {
                            var stringa = "effettuata"
                        }
                        else if(req.params.tipologia == 3) {
                           var stringa = "disdetta"
                        }
                        res.json({ ok: 'true', stato: stringa })
                    }

                })

            }

        })
    } catch (errore) {
        res.json({ ok: 'false', debug: errore })
    }
    console.log("GET operazione")

})

app.get('/DettagliLezione/:idlezione',(req,res) => {
    
    try{
        conn.query('SELECT * from lista_lezioni_vista WHERE id_lezione = "' + req.params.idlezione + '"', (err, rows, fields) => {
            //if (err) throw err
            if (err){
                res.json({ ok: 'false' })
            } else {
               
                if(rows.length >= 1){
                    var result = [];
                        for (let i=0;i<rows.length;i++) {
                            moment.locale('it')
                            var data_inizio_lezione = moment(rows[i].inizio_lezione).utcOffset(60).format('YYYY-MM-DD HH:mm') //rendere la data leggibile
                            var data_fine_lezione = moment(rows[i].fine_lezione).utcOffset(60).format('YYYY-MM-DD HH:mm')
                            var data_orario_inserimento = moment(rows[i].orario_inserimento).utcOffset(60).format('YYYY-MM-DD HH:mm')


                            result.push({ id_lezione: rows[i].id_lezione, id_insegnante: rows[i].id_insegnante, insegnante: rows[i].insegnante, materia: rows[i].materia, inizio_lezione: data_inizio_lezione, fine_lezione: data_fine_lezione, stato: rows[i].stato, cod_lezione : rows[i].cod_lezione, orario_inserimento: data_orario_inserimento})
                        }
                        res.json({ok:'true', data:result })
                        
                } else {
                    res.json({ ok: 'false' })
                }
                
            }
            
        })
    } catch(errore) {
        res.json ({ok:'false', debug:errore})
    }

    console.log("GET DettagliLezione")
    




})



app.listen(port, () => console.log('Server in ascolto'));

//TODO: spostare 
function getGiornoLezione(giornoDellaLezione){
    var today = new Date()
    if (today.getDay() == 5 || today.getDay() == 6){
        today.setDate(today.getDate() + 7);
    }
    var domenica = today.getDate() - today.getDay() //date = il numero del giorno del mese. day = numero del giorno della settimana
    let giornoLezione = domenica + giornoDellaLezione
    let dataLezione = new Date(today.setDate(giornoLezione))
    return dataLezione
}

