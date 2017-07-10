"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_tag_1 = require("graphql-tag");
var client_1 = require("./client");
function setLayout(nextState, replaceState, cb) {
    var _this = this;
    var page = nextState.params.page;
    var Layouts = nextState.routes[0].Layouts;
    return client_1.WordExpressClient.query({
        query: (_a = ["\n      query getPage($pageName: String!){\n        page(name: $pageName){\n          post_name,\n          layout{\n            id,\n            meta_value\n          }\n        }\n      }\n    "], _a.raw = ["\n      query getPage($pageName: String!){\n        page(name: $pageName){\n          post_name,\n          layout{\n            id,\n            meta_value\n          }\n        }\n      }\n    "], graphql_tag_1.default(_a)),
        variables: {
            pageName: page || 'homepage'
        }
    }).then(function (graphQLResult) {
        var errors = graphQLResult.errors, data = graphQLResult.data;
        var Layout;
        if (data.page) {
            if (data.page.layout) {
                Layout = Layouts[data.page.layout.meta_value] || Layouts['Default'];
            }
            else {
                Layout = Layouts['Default'];
            }
        }
        else {
            Layout = Layouts['NotFound'];
        }
        _this.layout = Layout;
        _this.component = Layout.Component;
        cb();
        if (errors) {
            console.log('got some GraphQL execution errors', errors);
        }
    }).catch(function (error) {
        console.log('there was an error sending the query', error);
    });
    var _a;
}
exports.setLayout = setLayout;
