const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
//controllers
const register = require('./controllers/register');
const signin = require('./controllers/signin');




const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'VTMNKCMT2real',
    database : 'facebrain'
  }
})

const app = express();

app.use(cors())
app.use(express.json());

app.get('/', (req, res)=>{
	res.json("Welcome home");
})

app.get('/users', (req, res) => {
	res.json(database.users);
})

app.get('/profile/:id', (req, res) =>{
	const { id } = req.params;
	db.select('*').from('users').where({
		id: id
	}).then(user => {
		if(!user.length){
			res.status(400).json("Error getting profile");
		}
		else{
			res.status(200).json(user[0]);
		}
	})
	.catch(err => { res.json("Oops! something went wrong.")});
	
})

app.put('/image', (req, res) => {
	const {id} = req.body;
	db('users')
	  .where('id', '=', id)
	  .increment({
	    count: 1
	  })
	  .returning('count').then(resp => {
	  	res.json(resp[0]);
	  })
	  .catch(err => {
	  	res.json('an unexpected error occured.')
	  })
})

//controlled endpoints.
app.post('/signin', (req, res) => signin.handleSignin(req, res, bcrypt, db));
app.post('/register', (req, res) => register.handleRegister(req, res, bcrypt,db));



app.listen((process.env.PORT || 3000), () => {
	console.log(`server running on PORT ${process.env.PORT}`);
})
// bcrypt.hash("bacon", null, null, function(err, hash) {
//     // Store hash in your password DB.
//     console.log(hash);
// });

// bcrypt.compare("bacon", "$2a$10$YDtRuHPzcSl4jLvhM9Dlw.8QWeSlB4.nYB4w8G9iryxHFAtmWPNHK", function(err, res) {
//     console.log(res);
// });
