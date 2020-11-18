'use strict';
// -------------------------
// Application Dependencies
// -------------------------
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');

// -------------------------
// Environment variables
// -------------------------
require('dotenv').config();
const HP_API_URL = process.env.HP_API_URL;

// -------------------------
// Application Setup
// -------------------------
const app = express();
const PORT = process.env.PORT || 3000;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({ extended: true }));

// Application Middleware override
app.use(methodOverride('_method'));

// Specify a directory for static resources
app.use(express.static('./public'));
app.use(express.static('./img'));

// Database Setup

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));

// Set the view engine for server-side templating

app.set('view engine', 'ejs');


// ----------------------
// ------- Routes -------
// ----------------------

//HOME
app.get('/', homePage);
function homePage(req,res){
  const url = 'http://hp-api.herokuapp.com/api/characters/house/:house ';
  superagent.get(url).then(data=>{
    const evArr = data.body.map(newData=>{
      return new Harry(newData);
    });
    res.render('home',{home1:evArr});
  });
}

function Harry(val){
  this.house = val.house;
  this.name = val.name;
  this.eyecolor = val.eyecolor;
}
//-------------------------
//ADD Character
app.post('/addChar', addCharFun);
function addCharFun(req,res){
  const sql = 'INSERT INTO harry (home, name, eyecolor) VALUES ($1, $2, $3);';
  const kolshiArr = [req.body.home, req.body.name, req.body.eyecolor];

  client.query(sql, kolshiArr).then(data=>{
    req.redirect('/favChar');
  });
}
app.get('/favChar', yourFav);
function yourFav(req,res){
  const sql = 'SELECT * FROM harry;';

  client.query(sql).then(data=>{
    res.render('/fav',{FAVO:data.rows});
  });
}
//-----------------------------------
//details
app.get('/details/:id',detailsFun);
function detailsFun(req,res){
  const sql = 'SELECT * FROM harry WHERE id=$1;';
  const kolshiArr = [req.params.id];

  client.query(sql, kolshiArr).then(data=>{
    res.render('details/:id', {mary:data.rows});
  });
}
//-----------------------------------
//UPDATE
app.put('/update/:id', updateFun);
function updateFun(req,res){
  const sql = 'UPDATE FROM harry SET home=$1, name=$2, eyecolor=$3 WHERE id=$4;';
  const kolshiArr = [req.body.home, req.body.name, req.body.eyecolor, req.params.id];

  client.query(sql, kolshiArr).then(data=>{
    res.render(`/details${req.params.id}`);
  });
}

//DELETE
app.get('/delete', removeF);
function removeF(res,req){
  const sql = 'DELETE * FROM harry WHERE id=$1;';
  const kolshiArr = [req.params.id];

  client.query(sql, kolshiArr).then(data=>{
    res.render('fav');
  });
}



// --------------------------------
// ---- Pages Routes functions ----
// --------------------------------



// -----------------------------------
// --- CRUD Pages Routes functions ---
// -----------------------------------



// Express Runtime
client.connect().then(() => {
  app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
}).catch(error => console.log(`Could not connect to database\n${error}`));
