const HtmlWebpackPlugin = require("html-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

const htmlPlugin = new HtmlWebpackPlugin({
  template: "./src/index.html"
});

const uglifyPlugin = new UglifyJsPlugin({
  exclude: /\/node_modules/,
  parallel: true,
  cache: true
});

module.exports = {
  htmlPlugin,
  uglifyPlugin
};