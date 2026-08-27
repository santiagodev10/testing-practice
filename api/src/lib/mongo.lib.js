const { MongoClient, ObjectId } = require("mongodb");

class MongoLib {
	constructor({ uri, dbName }) {
		this.client = new MongoClient(uri);
		this.dbName = dbName;
		this.connection = null;
	}

	async connect() {
		if (!this.connection) {
			await this.client.connect();
			this.connection = this.client.db(this.dbName);
		}
		return this.connection;
	}

	async getAll(collection, query = {}) {
		const db = await this.connect();
		return db.collection(collection).find(query).toArray();
	}

	async get(collection, id) {
		const db = await this.connect();
		return db.collection(collection).findOne({ _id: ObjectId.createFromHexString(id) });
	}

	async create(collection, data) {
		const db = await this.connect();
		const rta = await db.collection(collection).insertOne(data);
		return this.get(collection, rta.insertedId.toString());
	}

	async update(collection, id, data) {
		const db = await this.connect();
		await db.collection(collection).updateOne(
			{ _id: ObjectId.createFromHexString(id) },
			{ $set: data },
			{ upsert: true },
		);
		return this.get(collection, id);
	}

	async delete(collection, id) {
		const db = await this.connect();
		return db.collection(collection).deleteOne({ _id: ObjectId.createFromHexString(id) });
	}
}

module.exports = MongoLib;