# Cheatsheet: Funciones y métodos de Jest

Referencia rápida de las funciones de Jest más usadas al escribir tests, con ejemplos.

---

## 1. Estructura del test

| Función | Propósito | Ejemplo |
|---|---|---|
| `describe(name, fn)` | Agrupa tests relacionados | `describe("BooksService", () => {...})` |
| `test(name, fn)` / `it(name, fn)` | Define un test individual | `test("returns books", () => {...})` |
| `beforeEach(fn)` | Corre antes de **cada** test | limpiar estado, reinicializar un mock |
| `afterEach(fn)` | Corre después de **cada** test | `jest.clearAllMocks()` |
| `beforeAll(fn)` | Corre **una vez** antes de todo el grupo | abrir conexión |
| `afterAll(fn)` | Corre **una vez** después de todo el grupo | cerrar conexión |

```js
describe("BooksService", () => {
  let service;

  beforeEach(() => {
    service = new BooksService(mongoLibStub);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("trabaja", () => {
    expect(service).toBeDefined();
  });
});
```

---

## 2. Aserciones básicas (`expect`)

| Función | ¿Qué verifica? |
|---|---|
| `expect(x).toBe(y)` | Igualdad estricta (`===`) — para primitivos |
| `expect(x).toEqual(y)` | Igualdad **profunda** de objetos/arrays |
| `expect(x).toStrictEqual(y)` | Profunda + tipos exactos (undefined extra, etc.) |
| `expect(x).toBeTruthy()` / `.toBeFalsy()` | Valor "verdadero"/"falso" |
| `expect(x).toBeNull()` | Es `null` |
| `expect(x).toBeDefined()` / `.toBeUndefined()` | No/definido o no |
| `expect(x).toBeNaN()` | Es `NaN` |
| `expect(x).toBeInstanceOf(Class)` | Es instancia de una clase |
| `expect(arr).toContain(item)` | Array/string incluye el elemento |
| `expect(arr).toHaveLength(n)` | Longitud de array/string |
| `expect(obj).toHaveProperty(key, val?)` | Objeto tiene la propiedad (y opcional el valor) |
| `expect(str).toMatch(regexOrString)` | String coincide |
| `expect(fn).toThrow(err?)` | La función lanza un error al llamarla |

```js
expect(books).toEqual(fakeBooks);        // objetos
expect(books).toHaveLength(1);           // 1 elemento
expect(books[0]).toHaveProperty("name", "Harry Potter");
expect(() => parse("x")).toThrow(Error);
```

---

## 3. Operador `not`

Invierte cualquier aserción: `expect(x).not.toBe(y)`, `expect(mock).not.toHaveBeenCalled()`, etc.

---

## 4. Mocks de funciones (`jest.fn()`)

| Método | Propósito | Ejemplo |
|---|---|---|
| `jest.fn()` | Crea una función mock | `const fn = jest.fn()` |
| `.mockReturnValue(x)` | Devuelve valor **síncrono** | `db.get = jest.fn().mockReturnValue(1)` |
| `.mockResolvedValue(x)` | Devuelve una **promesa resuelta** | `db.getAll = jest.fn().mockResolvedValue(books)` |
| `.mockRejectedValue(err)` | Devuelve una **promesa rechazada** | `jest.fn().mockRejectedValue(new Error("boom"))` |
| `.mockImplementation(fn)` | Implementación personalizada | `jest.fn().mockImplementation(n => n * 2)` |
| `.mockImplementationOnce(fn)` | Implementación solo para la próxima llamada | simular fallo la primera vez |

```js
const getAll = jest.fn().mockResolvedValue([{ _id: 1, name: "HP" }]);
const getBook = jest.fn().mockImplementation((id) => ({ _id: id }));
```

**Nota:** cuando pruebas algo `async`, usa `mockResolvedValue` para que `await` reciba el valor real (no un Promise sin resolver).

---

## 5. Mocking de módulos y spies

| Función | Propósito | Ejemplo |
|---|---|---|
| `jest.mock("module")` | Reemplaza todo un módulo | `jest.mock("../lib/mongo.lib")` |
| `jest.spyOn(obj, "method")` | Espía un método real sin eliminarlo | `jest.spyOn(console, "log")` |
| `mock.restore()` | Restaura el método espía original | `spy.mockRestore()` |
| `jest.clearAllMocks()` | Limpia `calls`/`results` de todos | en `afterEach` |
| `jest.resetAllMocks()` | Resetea implementaciones + calls | en `afterEach` |
| `jest.restoreAllMocks()` | Restaura elementos espías | en `afterEach` |

```js
jest.mock("../lib/mongo.lib", () => ({
  getAll: jest.fn().mockResolvedValue([]),
}));
```

> Recuerda: `jest.mock` solo surte efecto si el archivo **importa** ese módulo. `BooksService` recibe su BD por constructor (DI), así que ahí un *stub inyectado* es lo correcto, no `jest.mock`.

---

## 6. Aserciones sobre mocks

| Función | Verifica |
|---|---|
| `expect(mock).toHaveBeenCalled()` | Se llamó al menos una vez |
| `expect(mock).toHaveBeenCalledTimes(n)` | Se llamó exactamente `n` veces |
| `expect(mock).toHaveBeenCalledWith(args)` | Se llamó con esos argumentos |
| `expect(mock).toHaveBeenLastCalledWith(args)` | La última llamada usó esos args |
| `expect(mock).not.toHaveBeenCalled()` | NO se llamó |
| `mock.mock.calls` | Historial de argumentos |
| `mock.mock.results` | Historial de resultados |

```js
expect(mongoLibStub.getAll).toHaveBeenCalledWith("books", {});
expect(mongoLibStub.create).toHaveBeenCalledTimes(1);
expect(mongoLibStub.create).not.toHaveBeenCalled();
```

---

## 7. Testing asíncrono

- Devuelve la promesa directamente en un test que espera datos:
  ```js
  test("async", async () => {
    const books = await service.getBooks();
    expect(books).toEqual(fakeBooks);
  });
  ```
- O usa `expect(...).resolves` / `.rejects`:
  ```js
  await expect(db.getAll()).resolves.toEqual(fakeBooks);
  await expect(db.create()).rejects.toThrow("fail");
  ```

---

## 8. Timers / control del tiempo

| Función | Propósito |
|---|---|
| `jest.useFakeTimers()` | Reemplaza setTimeout/setInterval por falsos |
| `jest.useRealTimers()` | Vuelve a los reales |
| `jest.runAllTimers()` | Ejecuta todas las tareas pendientes |
| `jest.advanceTimersByTime(ms)` | Avanza el reloj `ms` milisegundos |

---

## 9. Errores comunes a evitar

- **`toBe` vs `toEqual`**: `toBe` falla con objetos (`{} !== {}`); usa `toEqual` para objetos/arrays.
- **Olvidar `await`** antes de asertar sobre datos async (si no, comparas un Promise, no el valor).
- **`length` mal escrito**: es `length`, no `lenght`.
- **`toEqual()` sin argumento** → siempre falla; pásale el valor esperado.
- **Mock sin terminar de resolver**: usa `mockResolvedValue`, no `mockReturnValue`, para promesas.
- **Dejar `console.log`** de depuración antes de una aserción real (ruido + no verifica nada).

---

## 10. Las dos definiciones de "test de integración"

En el curso distinguen dos formas de entender un test de integración:

### Definición purista (teoría/academia)

Para ser un test de integración **de verdad**, la base de datos real debe participar en la verificación. El "riesgo de integración" vive en la capa de datos: que la consulta sea correcta, que el driver de Mongo funcione, que el round-trip de datos persista bien.

```
Estado ideal → http → rutas → servicio real → MongoLib real → MongoDB real
```

### Convención en desarrollo web (pragmática)

En el mundo web se suele llamar "integración" a **conectar las piezas de la API usando `supertest`**, aunque la BD esté **mockeada**. Así el test "vuela" sin depender de infraestructura externa (no hace falta docker, es rápido y determinista).

```
supertest → app Express real (rutas/router/JSON) → servicio MOCK (sin BD)
```

### Comparación

| Estilo | ¿Qué pregunta responde? | ¿BD en el loop? | ¿Infraestructura externa? |
|---|---|---|---|
| supertest + mock | "¿Mis capas HTTP se conectan y se comportan bien?" | ❌ | ❌ |
| Integración con BD real | "¿Mi capa de datos de verdad persiste y lee bien?" | ✅ | ✅ (docker / memory-server) |

### Clave a recordar

- Ninguna definición es "más correcta" que la otra: depende de lo que quieras cubrir.
- El estilo **supertest + mock** es rápido y confiable, pero **no** detecta errores reales de la capa de datos (una consulta rota, un nombre de colección mal, problemas del driver).
- El estilo **BD real** sí los detecta, pero exige una BD aislada (`demo_test`) o `mongodb-memory-server` para no tocar datos reales.
- Nuestro `books.e2e.test.js` (servicio mockeado) es, con la definición purista, más bien un test **de API/integración mockeada**, no un e2e con BD real.

---

## 11. Mini plantilla para un test de servicio (con DI)

```js
const BooksService = require("./books.service");

const fakeBooks = [{ _id: 1, name: "Harry Potter" }];

const mongoLibStub = {
  getAll: jest.fn().mockResolvedValue(fakeBooks),
  create: jest.fn().mockResolvedValue({ _id: 2, name: "LOTR" }),
};

describe("BooksService", () => {
  let service;

  beforeEach(() => {
    service = new BooksService(mongoLibStub);
  });

  test("getBooks devuelve la lista", async () => {
    const books = await service.getBooks({});
    expect(mongoLibStub.getAll).toHaveBeenCalledWith("books", {});
    expect(books).toEqual(fakeBooks);
  });
});
```
