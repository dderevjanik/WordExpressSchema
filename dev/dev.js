"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../src/index");
var GraphqlExpress = require("express-graphql");
var Express = require("express");
var graphql_tools_1 = require("graphql-tools");
var chalk_1 = require("chalk");
var PORT_DEV = 8004;
var settings = {
    publicSettings: {},
    privateSettings: {
        wp_prefix: 'wp_',
        database: {
            name: 'wordpress',
            username: 'root',
            password: 'usbw',
            host: 'localhost',
            port: 3307
        }
    }
};
console.log('connecting to database...');
var Database = new index_1.WordExpressDatabase(settings);
var Connectors = Database.connectors;
var Resolvers = index_1.WordExpressResolvers(Connectors, settings.privateSettings);
console.log('initializing schema...');
var executableSchema = graphql_tools_1.makeExecutableSchema({
    typeDefs: index_1.WordExpressDefinitions,
    resolvers: Resolvers
});
console.log('starting graphiql server...');
var app = Express();
app.use(GraphqlExpress({
    schema: executableSchema,
    graphiql: true
}));
app.get('/graphql', function (req, res) {
    res.send('ss');
});
app.listen(PORT_DEV);
console.log(chalk_1.green('graphiql server is listening on ') + chalk_1.underline.green("localhost:" + PORT_DEV));
