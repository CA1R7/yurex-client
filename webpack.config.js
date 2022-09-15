require("dotenv").config();
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

// main source ...
const mainPath = path.join(__dirname, "./src");
// Public folder which it means a static folder.
const publicPath = path.join(__dirname, "./public/assets");
// Build folder which it contains production files.
const buildPath = path.join(__dirname, "./build");

console.log("MODE_CLIENT: " + process.env.mode);

module.exports = {
  entry: `${mainPath}/index.tsx`,
  output: {
    path: buildPath,
    filename: "bundle.js",
  },
  devtool: false,
  mode: process.env.mode.trim(),
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  devServer: {},
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: ["ts-loader"],
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
          {
            loader: "sass-loader",
          },
        ],
      },
      {
        test: /\.(jpg|jpeg|png|gif|mp3|mp4|svg|woff|otf|ttf|wav|webp)$/,
        use: ["file-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
};
