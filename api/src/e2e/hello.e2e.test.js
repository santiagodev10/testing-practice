const request = require("supertest");
const createApp = require("../app");

describe("Test for GET /api/hello", () => {
   let app;
   let server;

   beforeAll(() => {
      app = createApp(); //Usa la función createApp para crear la aplicación Express
      server = app.listen(3001); // Inicia el servidor en un puerto diferente para evitar conflictos
   });
   
   afterAll(async () => {
      await server.close(); // Cierra el servidor después de todas las pruebas
   });

   describe("GET /", () => {
      test("Should return 200 OK and 'Hello World!'", async () => {
         const response = await request(app).get("/");
         expect(response.status).toBe(200);
         expect(response.text).toBe("Hello World!");
      });
   });
});