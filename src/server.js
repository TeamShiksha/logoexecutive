require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const routes = require("./routes");
const { routeNotFound, errorHandler } = require("./middlewares");

const port = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/", routes);

app.use(routeNotFound);
app.use(errorHandler);

app.listen({ port }, () => {
  console.log(`[Server] ready 🚀: http://localhost:${port}`);
});

module.exports = app;
