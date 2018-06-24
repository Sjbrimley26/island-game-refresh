const path = require("path");
const { htmlPlugin } = require("./webpackPlugins");


module.exports = {
  entry: [ 
    "babel-polyfill",
    "./src/app.js"
  ],
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "bundle.js",
    publicPath: "./"
  },
  watch: true,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      }
    ]
  },
  plugins: [
    htmlPlugin
  ]
}