const request = require("supertest");
const { ObjectId } = require("mongodb");
const createApp = require("../app");
const MongoLib = require("../lib/mongo.lib");
const BooksService = require("../services/books.service");
const { config } = require("../config");

describe("Test for /api/v1/books", () => {
   let app;
   let database;
   let mongoLib;
   const collectionName = "books";
   const seedBooks = [
      { _id: new ObjectId(), name: "The Hobbit", price: "15.99" },
      { _id: new ObjectId(), name: "Dune", price: "18.50" },
   ];

   beforeAll(async () => {
      // E2E usa las implementaciones reales y aquí solo esta cambiando la base de datos por una aislada.
      mongoLib = new MongoLib({
         uri: config.dbUrlE2E,
         dbName: config.dbNameE2E,
      });
      database = await mongoLib.connect();
      app = createApp(new BooksService(mongoLib));
   });

   beforeEach(async () => {
      // El seed hace que cada prueba empiece con un estado conocido y no dependa de ejecuciones anteriores.
      await database.collection(collectionName).deleteMany({});
      await database.collection(collectionName).insertMany(seedBooks);
   });

   afterAll(async () => {
      if (database) {
         await database.dropDatabase();
      }

      if (mongoLib) {
         await mongoLib.close();
      }
   });

   describe("GET /api/v1/books", () => {
      test("Should return 200 OK and a list of books", async () => {
         const response = await request(app).get("/api/v1/books");

         expect(response.status).toBe(200);
         expect(response.body).toHaveLength(seedBooks.length);
         expect(response.body).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: "The Hobbit", price: "15.99" }),
            expect.objectContaining({ name: "Dune", price: "18.50" }),
         ]));
      });
   });

   describe("POST /api/v1/books", () => {
      test("Should create and persist a book", async () => {
         const newBook = { name: "Neuromancer", price: "12.00" };

         const response = await request(app)
            .post("/api/v1/books")
            .send(newBook)
            .set("Content-Type", "application/json");

         expect(response.status).toBe(201);
         expect(response.body).toEqual(expect.objectContaining(newBook));
         expect(response.body._id).toBeDefined();

         // Verificar Mongo directamente confirma la persistencia, no solo la respuesta HTTP.
         const persistedBook = await database.collection(collectionName).findOne({
            name: newBook.name,
         });
         expect(persistedBook).toEqual(expect.objectContaining(newBook));
      });
   });
});
