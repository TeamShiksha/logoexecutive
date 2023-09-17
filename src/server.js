const dotenv = require("dotenv");

const app = require("./app");

if(process.env.NODE_ENV) {
	dotenv.config({path: `.env.${process.env.NODE_ENV}`});
} else {
	dotenv.config();
}

const port = process.env.PORT;

app.listen({ port }, () => {
  console.log(`[Server] ready 🚀: http://localhost:${port}`);
});

module.exports = app;
