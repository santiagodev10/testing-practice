const BooksService = require("./books.service");
const MongoLib = require("../lib/mongo.lib");

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

// SPY: partimos de una instancia REAL de MongoLib y espiáramos sus métodos.
// jest.spyOn(algoReal, "metodo") guarda una referencia al método real y lo reemplaza
// por un mock que observa las llamadas (white-box) pero que podemos controlar con
// mockResolvedValue. Así vemos la diferencia con el stub: el spy parte de algo real.
const realMongoLib = new MongoLib({ uri: "mongodb://fake", dbName: "demo" });
const getAllSpy = jest.spyOn(realMongoLib, "getAll").mockResolvedValue(fakeBooks);
const createSpy = jest.spyOn(realMongoLib, "create").mockResolvedValue({ _id: 2 });

describe("Tests for BooksService", () => {
   let service;

   // Se ejecuta antes de CADA test: se crea una instancia nueva del servicio
   // inyectándole la dependencia por constructor (inyección de dependencias / DI).
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

   // ------- Comparación: STUB -------
   describe("con stub (controlo un colaborador falso)", () => {
      describe("Test for getBooks", () => {
         test("Should return a list of books", async () => {
            //Act: ejecutar el método bajo prueba (con await porque es asíncrono)
            const books = await service.getBooks({});
            // BLACK BOX: asertar el resultado (salida). No importa cómo se hiciera,
            // solo que devolvió la lista esperada.
            expect(books).toEqual(fakeBooks);
         });

         test("Should forward the query to getAll", async () => {
            //Arrange: el query que esperamos que se reenvíe al stub
            const query = { title: "harry" };
            //Act
            await service.getBooks(query);
            // WHITE BOX: asertar cómo se llamó al colaborador interno (argumentos exactos)
            expect(mongoLibStub.getAll).toHaveBeenCalledWith("books", query);
         });

         test("Should pass undefined as query when no query is given", async () => {
            //Act: se llama sin argumentos, así que el query llega como undefined
            await service.getBooks();
            // WHITE BOX: verificar el reenvío del query undefined
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
            // WHITE BOX: verificar que create se llamó con la colección "books" y el libro
            expect(mongoLibStub.create).toHaveBeenCalledWith("books", newBook);
         });

         test("Should return the created book", async () => {
            //Arrange
            const newBook = { name: "Lord of the Rings" };
            const created = { _id: 2, ...newBook };
            mongoLibStub.create.mockResolvedValue(created);
            //Act
            const result = await service.createBook(newBook);
            // BLACK BOX: verificar el resultado devuelto (contenido y propiedad _id)
            expect(result).toEqual(created);
            expect(result).toHaveProperty("_id");
         });
      });
   });

   // ------- Comparación: SPY -------
   describe("con spy (observo un método real, controlado)", () => {
      beforeEach(() => {
         service = new BooksService(realMongoLib);
      });

      describe("Test for getBooks", () => {
         test("Should return a list of books", async () => {
            //Act
            const books = await service.getBooks({});
            // BLACK BOX: asertar el resultado. El spy devuelve fakeBooks (controlado).
            expect(books).toEqual(fakeBooks);
         });

         test("Should forward the query to getAll", async () => {
            //Arrange
            const query = { title: "harry" };
            //Act
            await service.getBooks(query);
            // WHITE BOX: el spy observa y registra los argumentos de la llamada real
            expect(getAllSpy).toHaveBeenCalledWith("books", query);
         });

         test("Should pass undefined as query when no query is given", async () => {
            //Act
            await service.getBooks();
            // WHITE BOX
            expect(getAllSpy).toHaveBeenCalledWith("books", undefined);
         });

         test("Should propagate errors from getAll", async () => {
            //Arrange: el spy se configura para simular un fallo de la BD
            getAllSpy.mockRejectedValue(new Error("db down"));
            //Act & Assert
            await expect(service.getBooks({})).rejects.toThrow("db down");
         });
      });

      describe("Test for createBook", () => {
         test("Should forward the new book to create", async () => {
            //Arrange
            const newBook = { name: "Lord of the Rings" };
            createSpy.mockResolvedValue({ _id: 3, ...newBook });
            //Act
            await service.createBook(newBook);
            // WHITE BOX
            expect(createSpy).toHaveBeenCalledWith("books", newBook);
         });

         test("Should return the created book", async () => {
            //Arrange
            const newBook = { name: "Lord of the Rings" };
            const created = { _id: 3, ...newBook };
            createSpy.mockResolvedValue(created);
            //Act
            const result = await service.createBook(newBook);
            // BLACK BOX
            expect(result).toEqual(created);
            expect(result).toHaveProperty("_id");
         });
      });
   });
});
