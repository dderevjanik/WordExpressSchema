import { WordExpressDefinitions, WordExpressDatabase, WordExpressResolvers } from '../src/index';
import * as GraphqlExpress from 'express-graphql';
import * as Express from 'express';
import { makeExecutableSchema } from 'graphql-tools';
import { green, underline } from 'chalk';

const PORT_DEV = 8004;

const settings = {
    publicSettings: {

    },
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

const Database = new WordExpressDatabase(settings);
const Connectors = Database.connectors;
const Resolvers = WordExpressResolvers(Connectors, settings.privateSettings);

console.log('initializing schema...');

const executableSchema = makeExecutableSchema({
    typeDefs: WordExpressDefinitions,
    resolvers: Resolvers
});


console.log('starting graphiql server...');

const app = Express();

app.use(GraphqlExpress({
    schema: executableSchema,
    graphiql: true
}));

app.get('/graphql', (req, res) => {
    res.send('ss');
});

app.listen(PORT_DEV);

console.log(green('graphiql server is listening on ') + underline.green(`localhost:${PORT_DEV}`));
