require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const defaultRoute = require("./routes/default-routes");
const userRoutes = require("./routes/user-routes");
const libraryRoutes = require("./routes/library-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
	next();
});
app.use("/", defaultRoute);
app.use("/library", libraryRoutes);
app.use("/auth", userRoutes);

app.use((req, res, next) => {
	const error = new HttpError("Could not find this route", 404);
	throw error;
});

// Middleware function with four parameters is recognized as an error function
app.use((error, req, res, next) => {
	// Checks if a response is sent
	if (res.headerSent) {
		return next(error);
	}

	// Actual error response
	res.status(error.code || 500).json({
		message: error.message || "An unknown error occured",
	});
});
mongoose
	.connect(
		`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@anime-tracker.kxha7.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
	)
	.then(() => {
		app.listen(process.env.DB_PORT);
	})
	.catch((err) => {
		console.log(err);
	});

/* Dependencies
npm install --save express body-parser
npm install --save-dev nodemon
npm install --save uuid
npm install --save express-validator
npm install --save mongoose
npm install --save mongoose-unique-validator
npm install --save dotenv
npm install --save bcryptjs
npm install --save jsonwebtoken
*/
