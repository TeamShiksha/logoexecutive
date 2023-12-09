const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const expressBang = require("express-bang");

const routes = require("./routes");
const { routeNotFound, errorHandler } = require("./middlewares");

const app = express();

app.use(cookieParser());
app.use(cors({credentials: true}));
app.use(express.json());
app.use(expressBang());

app.use("/", routes);

app.use(routeNotFound);
app.use(errorHandler);

module.exports = app;
