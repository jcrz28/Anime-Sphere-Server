const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true, minLength: 6 },

	// One user can have a multiple lists of anime
	animes: [{ type: mongoose.Types.ObjectId, required: true, ref: "Anime" }],
});

userSchema.plugin(uniqueValidator);
module.exports = mongoose.model("User", userSchema);
