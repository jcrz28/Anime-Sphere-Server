const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const HttpError = require("../models/http-error");
const Anime = require("../models/anime");
const User = require("../models/user");

const handleErrors = (errMessage, statusCode) => {
	return new HttpError(errMessage, statusCode);
};

const getAnimesByUserId = async (req, res, next) => {
	const userId = req.params.uid;

	try {
		const userWithAnime = await User.findById(userId).populate("animes");

		if (!userWithAnime) {
			throw handleErrors("Could not find an anime for user ID.", 404);
		}
		res.json({
			animes: userWithAnime.animes.map((anime) =>
				anime.toObject({ getters: true })
			),
		});
	} catch (error) {
		next(error);
	}
};

const getAnimesByTitle = async (req, res, next) => {
	const userId = req.params.uid;
	const title = req.params.title;
	try {
		const user = await User.findById(userId);

		if (!user) {
			throw handleErrors("Could not find user for provided id", 404);
		}
		const animes = await Anime.find({
			title: { $regex: title, $options: "i" },
			creator: user
		});
		res.json({
			animes: animes.map((anime) => anime.toObject({ getters: true })),
		});
	} catch (error) {
		next(error);
	}
};

const addAnime = async (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		throw handleErrors("Invalid fetch.", 422);
	}

	const { title, images, rating, score, genres, themes, creator } = req.body;

	try {
		const user = await User.findById(creator);

		if (!user) {
			throw handleErrors("Could not find user for provided id", 404);
		}

		const existingAnime = await Anime.findOne({
			title: title,
			creator: creator,
		});

		if (existingAnime) {
			throw handleErrors("Anime exists already.", 422);
		}

		const addedAnime = new Anime({
			title,
			images,
			rating,
			score,
			genres,
			themes,
			creator,
		});

		const session = await mongoose.startSession();
		session.startTransaction();
		await addedAnime.save({ session: session });
		user.animes.push(addedAnime);
		await user.save({ session: session });
		await session.commitTransaction();

		res.status(201).json({ addedAnime });
	} catch (error) {
		next(error);
	}
};

const deleteAnime = async (req, res, next) => {
	const animeId = req.params.aid;

	try {
		const anime = await Anime.findById(animeId).populate("creator");

		if (!anime) {
			throw handleErrors("Could not find the anime.", 404);
		}

		if (anime.creator.id !== req.userId.userId) {
			throw handleErrors(
				"You are not allowed to delete this anime.",
				403
			);
		}

		const session = await mongoose.startSession();
		session.startTransaction();
		await anime.remove({ session: session });
		anime.creator.animes.pull(anime);
		await anime.creator.save({ session: session });
		await session.commitTransaction();

		res.status(200).json({ message: "Anime Deleted." });
	} catch (error) {
		next(error);
	}
};

exports.getAnimesByUserId = getAnimesByUserId;
exports.getAnimesByTitle = getAnimesByTitle;
exports.addAnime = addAnime;
exports.deleteAnime = deleteAnime;
