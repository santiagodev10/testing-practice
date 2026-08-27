const express = require("express");
const booksApi = require("./books.router");

function routerApi(app, { booksService }) {
	const router = express.Router();
	app.use("/api/v1", router);
	router.use("/books", booksApi(booksService));
}

module.exports = routerApi;