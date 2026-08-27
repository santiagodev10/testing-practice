const express = require("express");

function booksApi(booksService) {
	const router = express.Router();

	router.get("/", async (req, res, next) => {
		try {
			const books = await booksService.getBooks();
			res.status(200).json(books);
		} catch (error) {
			next(error);
		}
	});

	router.post("/", async (req, res, next) => {
		try {
			const { body } = req;
			const newBook = await booksService.createBook(body);
			res.status(201).json(newBook);
		} catch (error) {
			next(error);
		}
	});

	return router;
}

module.exports = booksApi;