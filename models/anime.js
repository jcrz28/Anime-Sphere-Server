const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const animeSchema = new Schema({
	title: { type: String, required: true },
	images: {
		jpg: {
			image_url: { type: String, required: true },
		},
	},
	rating: { type: String },
	score: { type: Number },
	genres: [{ name: { type: String } }],
	themes: [{ name: { type: String } }],
	creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
});
animeSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Anime", animeSchema);
