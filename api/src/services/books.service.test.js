const BooksService = require("./books.service");

// FAKE: datos simulados que imitan lo que devolvería la base de datos.
// Se usan para que el test no dependa de una BD real.
const fakeBooks = [
   {
      _id: 1,
      name: "Harry Potter"
   }
];

// STUB: un objeto falso que imita el comportamiento de MongoLib.
// En vez de conectarse a MongoDB, solo devuelve la data fake.
// getAll() se configura con mockResolvedValue para que devuelva una promesa resuelta (async).
// create() queda como jest.fn() porque su implementación se define por test.
const mongoLibStub = {
   getAll: jest.fn().mockResolvedValue(fakeBooks),
   create: jest.fn()
};

describe("Tests for BooksService", () => {
   let service;

   // Se ejecuta antes de CADA test: se crea una instancia nueva del servicio
   // inyectándole el stub por constructor (inyección de dependencias / DI).
   // Esto es lo que hace que NO haga falta jest.mock: la dependencia entra por parámetro, no por require.
   beforeEach(() => {
      service = new BooksService(mongoLibStub);
   });

   // Se ejecuta después de CADA test: limpia el historial de llamadas (mock.calls)
   // de todos los mocks para que un test no contamine las aserciones del siguiente.
   // NO borra las implementaciones (mockResolvedValue), solo el registro de invocaciones.
   afterEach(() => {
      jest.clearAllMocks();
   });

   describe("Test for getBooks", () => {
      test("Should return a list of books", async () => {
         //Arrange: preparar datos / estado (aquí no hace falta, ya está el stub)
         //Act: ejecutar el método bajo prueba (con await porque es asíncrono)
         const books = await service.getBooks({});
         //Assert: verificar el resultado
         // Se comprueba que getAll se llamó con la colección "books" y el query {}
         expect(mongoLibStub.getAll).toHaveBeenCalledWith("books", {});
         // toEqual compara objetos/arrays por contenido (igualdad profunda)
         expect(books).toEqual(fakeBooks);
      });

      test("Should forward the query to getAll", async () => {
         //Arrange: el query que esperamos que se reenvíe al stub
         const query = { title: "harry" };
         //Act
         await service.getBooks(query);
         //Assert: toHaveBeenCalledWith verifica los argumentos exactos con los que se llamó al mock
         expect(mongoLibStub.getAll).toHaveBeenCalledWith("books", query);
      });

      test("Should pass undefined as query when no query is given", async () => {
         //Act: se llama sin argumentos, así que el query llega como undefined
         await service.getBooks();
         //Assert: el servicio reenvía "books" y undefined tal cual
         expect(mongoLibStub.getAll).toHaveBeenCalledWith("books", undefined);
      });

      test("Should propagate errors from getAll", async () => {
         //Arrange: se configura el stub para que simule un fallo de la BD (promesa rechazada)
         mongoLibStub.getAll.mockRejectedValue(new Error("db down"));
         //Act & Assert: .rejects espera que la promesa sea rechazada y verifica el mensaje del error
         await expect(service.getBooks({})).rejects.toThrow("db down");
      });
   });

   describe("Test for createBook", () => {
      test("Should forward the new book to create", async () => {
         //Arrange: datos del libro nuevo y configurar el valor que devuelve el stub
         const newBook = { name: "Lord of the Rings" };
         mongoLibStub.create.mockResolvedValue({ _id: 2, ...newBook });
         //Act
         await service.createBook(newBook);
         //Assert: se verifica que create se llamó con la colección "books" y el libro
         expect(mongoLibStub.create).toHaveBeenCalledWith("books", newBook);
      });

      test("Should return the created book", async () => {
         //Arrange
         const newBook = { name: "Lord of the Rings" };
         const created = { _id: 2, ...newBook };
         mongoLibStub.create.mockResolvedValue(created);
         //Act
         const result = await service.createBook(newBook);
         //Assert: toHaveProperty verifica que el objeto devuelto tenga la propiedad _id
         expect(result).toEqual(created);
         expect(result).toHaveProperty("_id");
      });
   });
});
