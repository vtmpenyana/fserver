const handleSignin = (req, res, bcrypt, db) => {
	const {email, password} = req.body;
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
}


module.exports = {
	handleSignin
}
