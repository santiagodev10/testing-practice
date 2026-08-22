test("test obj", () => {
	const data = {
		name: "Santiago",
	};

	data.lastname = "Perozo";

	expect(data).toEqual({
		name: "Santiago",
		lastname: "Perozo",
	});
});

test("test null", () => {
	const data = null;

	expect(data).toBeNull();
	expect(data).toBeDefined();
	//Con .not, negamos la afirmación
	expect(data).not.toBeUndefined();
});

test("test booleans", () => {
	expect(true).toEqual(true);
	expect(false).toEqual(false);

	//toBeFalsy() evalua si el valor es un falsy value, recordemos que hay 8 valores falsy definidos de la especificación oficial de JavaScript, que son el 0, un string vacío "", false, null, undefined, NaN, -0, 0n
	expect(0).toBeFalsy();
	expect("").toBeFalsy();
	expect(false).toBeFalsy();
});

test("test strings", () => {
	//toMatch solo funciona con strings, y se usan substrings y regex para hacer la comparación. En este caso estamos usando una regex, en donde esta evaluando que esas letras "nti" están o no, en el string que se le pasa al matcher.
	expect("Santiago").toMatch(/nti/);
});

test("test lists or array", () => {
	const numbers = [1, 2, 3, 4];

	expect(numbers).toContain(3);
});
