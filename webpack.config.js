const path = require("path")

module.exports = {
  mode: "development",
  entry: "./src/app/index.js",
  output: {
    path: path.resolve(__dirname, "dist/app"),
    filename: "app.js",
  },

  watch: true,
}