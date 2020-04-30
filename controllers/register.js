const handleRegister = (req, res, bcrypt, db)=>{
	const {name, email, password} = req.body;
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
}

module.exports = {
	handleRegister
}


