const express = require("express");
const { check } = require("express-validator");

const router = express.Router();
const libraryControllers = require("../controllers/library-controller");
const checkAuth = require("../middleware/check-auth");

router.get("/:uid", libraryControllers.getAnimesByUserId);
router.get("/:uid/:title", libraryControllers.getAnimesByTitle);

router.use(checkAuth);
router.post(
	"/:uid",
	[
		check("title").not().isEmpty(),
		check("images.jpg.image_url").not().isEmpty(),
	],
	libraryControllers.addAnime
);
router.delete("/:uid/:aid", libraryControllers.deleteAnime);
module.exports = router;
