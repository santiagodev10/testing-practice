const express = require("express");
const cors = require("cors");
const routerApi = require("./routes");

function createApp(booksService) {
	const app = express();
	app.use(cors());
	app.use(express.json());

	app.get("/", (req, res) => {
		res.send("Hello World!");
	});

	routerApi(app, { booksService });

	app.use((err, req, res, _next) => {
		console.error(err);
		res.status(500).json({ message: "Internal Server Error" });
	});

	return app;
}

module.exports = createApp;