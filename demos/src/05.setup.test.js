//describe permite agrupar un conjunto de tests
describe("Set of tests", () => {
	//beforeAll sirve para ejecutar algo necesario para los tests, antes de que se ejecuten los mismos, por ejemplo talvez sea necesario levantar una base de datos, para que los tests puedan probar ciertas operaciones
	beforeAll(() => {
		console.log("beforeAll");
		//Levantar base de datos
	});

	//afterAll sirve para limpiar o cerrar el estado o proceso que se haya abierto para correr las pruebas, si no se hace esta limpieza termina ocurriendo un estado de fuga. Esto significa que los datos modificados por un test alterarán el resultado de los siguientes, generando falsos positivos o errores fantasma por duplicidad de datos.
	afterAll(() => {
		console.log("afterAll");
		//Bajar base de datos
	});

	beforeEach(() => {
		console.log("beforeEach");
	});

	afterEach(() => {
		console.log("afterEach");
	});

	test("case 1", () => {
		console.log("case 1");
		expect(1 + 1).toBe(2);
	});

	test("case 2", () => {
		console.log("case 2");
		expect(1 + 3).toBe(4);
	});

	//También podemos agrupar un otro conjunto con un describe anidado dentro de otro
	describe("Other group of tests", () => {
		test("case 3", () => {
			console.log("case 3");
			expect(1 + 1).toBe(2);
		});

		test("case 4", () => {
			console.log("case 4");
			expect(5 + 5).toBe(10);
		});
	});
});
