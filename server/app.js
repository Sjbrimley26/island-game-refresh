"use strict";

const R = require("rambda");

const express = require("express");
const app = express();
const server = require("http").createServer(app);
const socketIO = require("socket.io")(server);
const io = require("./socket").addSocketFunctions(socketIO);
const compression = require("compression");

const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 3000;

app.use(compression());

app.use(express.static("../client/build"));

app.use('/assets', express.static("../client/assets"));

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "../client/build/" });
});

server.listen(PORT, () => console.log(`Now listening on port ${PORT}`));