const mysql = require('mysql');

class Db {
	constructor(config) {
		this.connection = mysql.createPool({
			host: process.env.DB_HOST,
			user: process.env.DB_USER_NAME,
			password: process.env.DB_USER_PASSWORD,
			database: process.env.DB,
			debug: false
		});
	}
	query(sql, args) {
		return new Promise((resolve, reject) => {
			this.connection.query(sql, args, (err, rows) => {
				if (err)
					return reject(err);
				resolve(rows);
			});
		});
	}
	close() {
		return new Promise((resolve, reject) => {
			this.connection.end(err => {
				if (err)
					return reject(err);
				resolve();
			});
		});
	}
}
module.exports = new Db();