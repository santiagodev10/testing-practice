require("dotenv").config();

const config = {
	env: process.env.NODE_ENV || "dev",
	isProd: process.env.NODE_ENV === "production",
	port: process.env.PORT || 3000,
	dbUrl: process.env.MONGO_URL,
	dbUrlE2E: process.env.MONGO_URL_E2E,
	dbName: process.env.MONGO_DB_NAME,
	dbNameE2E: process.env.MONGO_DB_NAME_E2E,
};

module.exports = { config };