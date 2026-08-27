const { config } = require("./config");
const MongoLib = require("./lib/mongo.lib");
const BooksService = require("./services/books.service");
const createApp = require("./app");

const mongoLib = new MongoLib({
	uri: config.dbUrl,
	dbName: config.dbName,
});
const booksService = new BooksService(mongoLib);

const app = createApp(booksService);

app.listen(config.port, (err) => {
	if (err) {
		console.error("Error: ", err);
	}
});