const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const Anime = require("../models/anime");
const HttpError = require("../models/http-error");

const handleErrors = (errMessage, statusCode) => {
	return new HttpError(errMessage, statusCode);
};

const generateToken = (userId) => {
	return jwt.sign({ userId }, process.env.SECRET_KEY, { expiresIn: "1h" });
};

const signup = async (req, res, next) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			throw handleErrors("Invalid inputs. Please check your data.", 422);
		}

		const { username, password, confirm_password } = req.body;

		if (password !== confirm_password) {
			throw handleErrors(
				"Password did not match. Please try again.",
				401
			);
		}

		const existingUser = await User.findOne({ username: username });

		if (existingUser) {
			throw handleErrors(
				"User exists already. Please login instead",
				422
			);
		}

		const hashedPassword = await bcrypt.hash(password, 12);
		const createdUser = new User({ username, password: hashedPassword }); // second parameter salts the hashed password

		await createdUser.save();

		const token = generateToken(createdUser.id);

		res.status(201).json({
			userId: createdUser.id,
			username: createdUser.username,
			token: token,
		});
	} catch (error) {
		next(error);
	}
};

const login = async (req, res, next) => {
	try {
		const { username, password } = req.body;

		const existingUser = await User.findOne({ username: username });

		if (!existingUser) {
			throw handleErrors("Invalid credentials.", 401);
		}

		const isValidPassword = await bcrypt.compare(
			password,
			existingUser.password
		);
		if (!isValidPassword) {
			throw handleErrors("Invalid credentials.", 401);
		}

		const token = generateToken(existingUser.id);

		res.json({
			userId: existingUser.id,
			username: existingUser.username,
			token: token,
		});
	} catch (error) {
		next(error);
	}
};

const unsubscribe = async (req, res, next) => {
	try {
		const { username, password } = req.body;

		const existingUser = await User.findOne({ username: username });

		if (!existingUser) {
			throw handleErrors("Invalid credentials.", 401);
		}

		const isValidPassword = await bcrypt.compare(
			password,
			existingUser.password
		);
		if (!isValidPassword) {
			throw handleErrors("Invalid credentials.", 401);
		}

		await Anime.deleteMany({ creator: existingUser }); // Deletes all anime lists by the user
		await existingUser.remove(); // Deletes the user

		res.status(200).json({ message: "User Deleted." });
	} catch (error) {
		next(error);
	}
};

exports.signup = signup;
exports.login = login;
exports.unsubscribe = unsubscribe;
