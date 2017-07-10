"use strict";
// @ts-check
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @param {object} Connectors
 * @param {Settings} publicSettings
 */
function WordExpressResolvers(Connectors, publicSettings) {
    var Resolvers = {
        Query: {
            settings: function () {
                return publicSettings;
            },
            category: function (_, _a) {
                var term_id = _a.term_id;
                return Connectors.getCategoryById(term_id);
            },
            posts: function (_, args) {
                return Connectors.getPosts(args);
            },
            menus: function (_, _a) {
                var name = _a.name;
                return Connectors.getMenu(name);
            },
            post: function (_, _a) {
                var name = _a.name, id = _a.id;
                if (name) {
                    return Connectors.getPostByName(name, id);
                }
                return Connectors.getPostById(id);
            },
            postmeta: function (_, _a) {
                var postId = _a.postId;
                return Connectors.getPostmeta(postId);
            },
            user: function (_, _a) {
                var userId = _a.userId;
                return Connectors.getUser(userId);
            },
        },
        Category: {
            posts: function (category, args) {
                return Connectors.getPostsInCategory(category.term_id, args);
            }
        },
        Post: {
            layout: function (post) {
                return Connectors.getPostLayout(post.id);
            },
            post_meta: function (post, keys) {
                return Connectors.getPostmeta(post.id, keys);
            },
            thumbnail: function (post) {
                return Connectors.getPostThumbnail(post.id);
            },
            author: function (post) {
                return Connectors.getUser(post.post_author);
            }
        },
        Postmeta: {
            connecting_post: function (postmeta) {
                return Connectors.getPostById(postmeta.meta_value);
            }
        },
        Menu: {
            items: function (menu) {
                return menu.items;
            }
        },
        MenuItem: {
            navitem: function (menuItem) {
                return Connectors.getPostById(menuItem.linkedId);
            },
            children: function (menuItem) {
                return menuItem.children;
            }
        }
    };
    return Resolvers;
}
exports.WordExpressResolvers = WordExpressResolvers;
