class BooksService {
	constructor(mongoDB) {
		this.collection = "books";
		this.mongoDB = mongoDB;
	}

	getBooks(query) {
		return this.mongoDB.getAll(this.collection, query);
	}

	createBook(newBook) {
		return this.mongoDB.create(this.collection, newBook);
	}
}

module.exports = BooksService;