const mongoose = require("mongoose");

/**
 * Queries issued by code paths that are not backed by a mocked service should
 * fail fast instead of buffering until after the test run has finished.
 */
mongoose.set("bufferCommands", false);
