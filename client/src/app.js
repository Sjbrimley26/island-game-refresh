import "babel-polyfill";

const R = require("rambda");
const socket = require("../assets/network/socket");
const { connect_socket_to_server } = socket;

const connection = {};
const client = connect_socket_to_server(connection);

const sampleUser = {
  name: "Spencer",
  age: 23,
  id: new Date().getUTCMilliseconds()
};

client.connectUser(sampleUser);