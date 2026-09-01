const request = require("supertest");
const createApp = require("../app");
const { generateManyBooks } = require("../fakes/book.fake");

describe("Test for /api/v1/books", () => {
   let app;
   let server;

   const fakeBooks = generateManyBooks(5);

   // FAKE SERVICE: sustituye a BooksService + MongoLib. No toca la BD real.
   const fakeBooksService = {
      getBooks: jest.fn().mockResolvedValue(fakeBooks),
      createBook: jest.fn(),
   };

   beforeAll(() => {
      app = createApp(fakeBooksService); // ← inyecta el servicio falso (el fix)
      server = app.listen(3001);
   });

   afterAll(async () => {
      await server.close();
   });

   describe("GET /api/v1/books", () => {
      test("Should return 200 OK and a list of books", async () => {
         const response = await request(app).get("/api/v1/books");
         console.log("Fake books:", response.body); // ← visible en consola
         expect(response.status).toBe(200);
         expect(response.body).toEqual(fakeBooks);
         expect(fakeBooksService.getBooks).toHaveBeenCalled();
      });
   });
});
