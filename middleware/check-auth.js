require("dotenv").config();
const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
	if (req.method === "OPTIONS") {
		return next(); // continues to try catch logic
	}
	try {
		const token = req.headers.authorization.split(" ")[1]; // Authorization: 'Bearer TOKEN'
		if (!token) {
			throw new Error("Authentication failed!");
		}
		const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
		req.userId = { userId: decodedToken.userId }; // Dynamic request
		next();
	} catch (err) {
		const error = new HttpError("Authentication failed!", 403);
		return next(error);
	}
};
