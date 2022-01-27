const express = require("express");

const postController = require("../contollers/postController");

// Middleware
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// localhost:3000/
router.route("/")
    .get(postController.getAllPosts)
    .post( postController.createPost);

router
    .route("/:id")
    .get(postController.getOnPost)
    .patch(postController.updatePost)
    .delete(postController.deletePost);

module.exports = router;