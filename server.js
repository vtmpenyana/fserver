const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

//controllers
// const register = require('./controllers/register');
// const signin = require('./controllers/signin');




const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  }
})

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res)=>{
	res.json("Welcome home");
})

app.post('/signin', (req, res) => {
	const {email, password} = req.body;
	res.json(email, password);
	db.select('hash').from('login').where({
		email: req.body.email
	}).then(data => {
		//hashing passwords
		if(bcrypt.compareSync(req.body.password, data[0].hash)){
			return db.select('*').from('users').where({
				email: req.body.email
			}).then(user => {
				res.json(user[0]);
			})
			.catch(err => console.log("Unable to login user in"));
		}
		else{
			res.json("Wrong credential provided");
		}
	}).catch(err => {console.log("Couldn't sign in")});
});

app.post('/register', (req, res) => {
	const {name, email, password} = req.body;
	res.json(name, email, password);
	console.log(email, name, password);
	db.transaction(trx => {
		trx('login').insert({
			email: email,
			hash: bcrypt.hashSync(password)
		}).returning('email').then(loginEmail => {
			return trx('users').insert({
				email: loginEmail[0],
				name: name,
				joined: new Date()
			}).returning('*')
		}).then(user => {
			res.status(200).json(user[0])
		})
		.then(trx.commit).catch(trx.rollback)
	})
});


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
