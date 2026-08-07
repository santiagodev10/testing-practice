function sum(a, b) {
	return a + b;
}

function multiply(a, b) {
	return a * b;
}

function divide(a, b) {
	if (b === 0) {
		return null;
	}

	return a / b;
}

function mean(...numbers) {
	const total = numbers.length;

	if (total === 0) {
		return null;
	}

	if (!numbers.every((value) => Number.isFinite(value))) {
		return "Only pass numbers to this function";
	}

	const add = numbers.reduce((acc, value) => acc + value, 0);

	return add / total;
}

module.exports = {
	sum,
	multiply,
	divide,
	mean,
};
