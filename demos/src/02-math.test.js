const { sum, multiply, divide, mean } = require("./02-math");

describe("Tests for math operations", () => {
	describe("Test for sum", () => {
		test("adds 1 + 2 to equal 3", () => {
			const answer = sum(1, 2);
			expect(answer).toBe(3);
		});
	});

	describe("Test for multiplication", () => {
		test("multiplies 2 * 3 to equal 6", () => {
			expect(multiply(2, 3)).toBe(6);
		});
	});

	describe("Test for division", () => {
		test("should divide", () => {
			const answer1 = divide(6, 2);
			const answer2 = divide(6, 3);
			const answer3 = divide(6, 0);

			expect(answer1).toBe(3);
			expect(answer2).toBe(2);
			expect(answer3).toBe(null);
		});
	});

	describe("Test for mean", () => {
		test("should calculate mean", () => {
			expect(mean(10, 20, 30)).toBe(20);
		});
	});
});
