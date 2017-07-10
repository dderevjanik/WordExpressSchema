"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var apollo_client_1 = require("apollo-client");
var networkInterface = apollo_client_1.createNetworkInterface({ uri: '/graphql' });
exports.WordExpressClient = new apollo_client_1.default({
    networkInterface: networkInterface,
});
