"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sequelize_1 = require("sequelize");
var lodash_1 = require("lodash");
var php_unserialize_1 = require("php-unserialize");
;
var WordExpressDatabase = (function () {
    function WordExpressDatabase(settings) {
        this.settings = settings;
        this.connection = this.connect();
        this.connectors = this.getConnectors();
        this.models = this.getModels();
    }
    WordExpressDatabase.prototype.connect = function () {
        var _a = this.settings.privateSettings.database, name = _a.name, username = _a.username, password = _a.password, host = _a.host, port = _a.port;
        var Conn = new sequelize_1.default(name, username, password, {
            dialect: 'mysql',
            host: host,
            port: port || 3306,
            define: {
                timestamps: false,
                freezeTableName: true,
            }
        });
        return Conn;
    };
    WordExpressDatabase.prototype.getModels = function () {
        var prefix = this.settings.privateSettings.wp_prefix;
        var Conn = this.connection;
        return {
            Post: Conn.define(prefix + 'posts', {
                id: { type: sequelize_1.default.INTEGER, primaryKey: true },
                post_author: { type: sequelize_1.default.INTEGER },
                post_title: { type: sequelize_1.default.STRING },
                post_content: { type: sequelize_1.default.STRING },
                post_excerpt: { type: sequelize_1.default.STRING },
                post_status: { type: sequelize_1.default.STRING },
                post_type: { type: sequelize_1.default.STRING },
                post_name: { type: sequelize_1.default.STRING },
                post_parent: { type: sequelize_1.default.INTEGER },
                menu_order: { type: sequelize_1.default.INTEGER }
            }),
            Postmeta: Conn.define(prefix + 'postmeta', {
                meta_id: { type: sequelize_1.default.INTEGER, primaryKey: true, field: 'meta_id' },
                post_id: { type: sequelize_1.default.INTEGER },
                meta_key: { type: sequelize_1.default.STRING },
                meta_value: { type: sequelize_1.default.INTEGER },
            }),
            User: Conn.define(prefix + 'users', {
                id: { type: sequelize_1.default.INTEGER, primaryKey: true },
                user_nicename: { type: sequelize_1.default.STRING },
                user_email: { type: sequelize_1.default.STRING },
                user_registered: { type: sequelize_1.default.STRING },
                display_name: { type: sequelize_1.default.STRING }
            }),
            Terms: Conn.define(prefix + 'terms', {
                term_id: { type: sequelize_1.default.INTEGER, primaryKey: true },
                name: { type: sequelize_1.default.STRING },
                slug: { type: sequelize_1.default.STRING },
                term_group: { type: sequelize_1.default.INTEGER },
            }),
            TermRelationships: Conn.define(prefix + 'term_relationships', {
                object_id: { type: sequelize_1.default.INTEGER, primaryKey: true },
                term_taxonomy_id: { type: sequelize_1.default.INTEGER },
                term_order: { type: sequelize_1.default.INTEGER },
            }),
            TermTaxonomy: Conn.define(prefix + 'term_taxonomy', {
                term_taxonomy_id: { type: sequelize_1.default.INTEGER, primaryKey: true },
                term_id: { type: sequelize_1.default.INTEGER },
                taxonomy: { type: sequelize_1.default.STRING },
                parent: { type: sequelize_1.default.INTEGER },
                count: { type: sequelize_1.default.INTEGER },
            })
        };
    };
    WordExpressDatabase.prototype.getConnectors = function () {
        var _a = this.settings.publicSettings, amazonS3 = _a.amazonS3, uploads = _a.uploads;
        var _b = this.getModels(), Post = _b.Post, Postmeta = _b.Postmeta, User = _b.User, Terms = _b.Terms, TermRelationships = _b.TermRelationships;
        Terms.hasMany(TermRelationships, { foreignKey: 'term_taxonomy_id' });
        TermRelationships.belongsTo(Terms, { foreignKey: 'term_taxonomy_id' });
        TermRelationships.hasMany(Postmeta, { foreignKey: 'post_id' });
        Postmeta.belongsTo(TermRelationships, { foreignKey: 'post_id' });
        TermRelationships.belongsTo(Post, { foreignKey: 'object_id' });
        Post.hasMany(Postmeta, { foreignKey: 'post_id' });
        Postmeta.belongsTo(Post, { foreignKey: 'post_id' });
        return {
            getPosts: function (_a) {
                var post_type = _a.post_type, _b = _a.limit, limit = _b === void 0 ? 10 : _b, _c = _a.skip, skip = _c === void 0 ? 0 : _c;
                return Post.findAll({
                    where: {
                        post_type: post_type,
                        post_status: 'publish'
                    },
                    limit: limit,
                    offset: skip
                });
            },
            getPostsInCategory: function (termId, _a) {
                var post_type = _a.post_type, _b = _a.limit, limit = _b === void 0 ? 10 : _b, _c = _a.skip, skip = _c === void 0 ? 0 : _c;
                return TermRelationships.findAll({
                    attributes: [],
                    include: [{
                            model: Post,
                            where: {
                                post_type: post_type,
                                post_status: 'publish'
                            }
                        }],
                    where: {
                        term_taxonomy_id: termId
                    },
                    limit: limit,
                    offset: skip
                }).then(function (posts) { return lodash_1.default.map(posts, function (post) { return post.wp_post; }); });
            },
            getCategoryById: function (termId) {
                return Terms.findOne({
                    where: { termId: termId }
                });
            },
            getPostById: function (postId) {
                return Post.findOne({
                    where: {
                        post_status: 'publish',
                        id: postId
                    }
                }).then(function (post) {
                    if (post) {
                        var id = post.dataValues.id;
                        post.dataValues.children = [];
                        return Post.findAll({
                            attributes: ['id'],
                            where: {
                                post_parent: id
                            }
                        }).then(function (childPosts) {
                            if (childPosts.length > 0) {
                                lodash_1.default.map(childPosts, function (childPost) {
                                    post.dataValues.children.push({ id: Number(childPost.dataValues.id) });
                                });
                            }
                            return post;
                        });
                    }
                    return null;
                });
            },
            getPostByName: function (name) {
                return Post.findOne({
                    where: {
                        post_status: 'publish',
                        post_name: name
                    }
                });
            },
            /**
             * @param {number} postId
             */
            getPostThumbnail: function (postId) {
                return Postmeta.findOne({
                    where: {
                        post_id: postId,
                        meta_key: '_thumbnail_id'
                    }
                }).then(function (res) {
                    if (res) {
                        var metaKey = amazonS3 ? 'amazonS3_info' : '_wp_attached_file';
                        return Post.findOne({
                            where: {
                                id: Number(res.dataValues.meta_value)
                            },
                            include: {
                                model: Postmeta,
                                where: {
                                    meta_key: metaKey
                                },
                                limit: 1
                            }
                        }).then(function (post) {
                            if (post.wp_postmeta[0]) {
                                var thumbnail = post.wp_postmeta[0].dataValues.meta_value;
                                var thumbnailSrc = amazonS3 ?
                                    uploads + php_unserialize_1.default.unserialize(thumbnail).key :
                                    uploads + thumbnail;
                                return thumbnailSrc;
                            }
                            return null;
                        });
                    }
                    return null;
                });
            },
            getUser: function (userId) {
                return User.findOne({
                    where: {
                        ID: userId
                    }
                });
            },
            getPostLayout: function (postId) {
                return Postmeta.findOne({
                    where: {
                        post_id: postId,
                        meta_key: 'page_layout_component'
                    }
                });
            },
            getPostmetaById: function (metaId, keys) {
                return Postmeta.findOne({
                    where: {
                        meta_id: metaId,
                        meta_key: {
                            $in: keys
                        }
                    }
                });
            },
            getPostmeta: function (postId, keys) {
                return Postmeta.findAll({
                    where: {
                        post_id: postId,
                        meta_key: {
                            $in: keys
                        }
                    }
                });
            },
            getMenu: function (name) {
                return Terms.findOne({
                    where: {
                        slug: name
                    },
                    include: [{
                            model: TermRelationships,
                            include: [{
                                    model: Post,
                                    include: [Postmeta]
                                }]
                        }]
                }).then(function (res) {
                    if (res) {
                        var menu_1 = {
                            id: null,
                            name: name,
                            items: null,
                        };
                        menu_1.id = res.term_id;
                        var relationship = res.wp_term_relationships;
                        var posts = lodash_1.default.map(lodash_1.default.map(lodash_1.default.map(relationship, 'wp_post'), 'dataValues'), function (post) {
                            var postmeta = lodash_1.default.map(post.wp_postmeta, 'dataValues');
                            var parentMenuId = lodash_1.default.map(lodash_1.default.filter(postmeta, function (meta) {
                                return meta.meta_key === '_menu_item_menu_item_parent';
                            }), 'meta_value');
                            post.post_parent = parseInt(parentMenuId[0]);
                            return post;
                        });
                        var navItems_1 = [];
                        var parentIds_1 = lodash_1.default.map(lodash_1.default.filter(posts, function (post) { return (post.post_parent === 0); }), 'id');
                        lodash_1.default.map(lodash_1.default.sortBy(posts, 'post_parent'), function (post) {
                            var navItem = {};
                            var postmeta = lodash_1.default.map(post.wp_postmeta, 'dataValues');
                            var isParent = lodash_1.default.includes(parentIds_1, post.id);
                            var objectType = lodash_1.default.map(lodash_1.default.filter(postmeta, function (meta) {
                                return meta.meta_key === '_menu_item_object';
                            }), 'meta_value');
                            var linkedId = Number(lodash_1.default.map(lodash_1.default.filter(postmeta, function (meta) {
                                return meta.meta_key === '_menu_item_object_id';
                            }), 'meta_value'));
                            if (isParent) {
                                navItem.id = post.id;
                                navItem.post_title = post.post_title;
                                navItem.order = post.menu_order;
                                navItem.linkedId = linkedId;
                                navItem.object_type = objectType;
                                navItem.children = [];
                                navItems_1.push(navItem);
                            }
                            else {
                                var parentId_1 = Number(lodash_1.default.map(lodash_1.default.filter(postmeta, function (meta) {
                                    return meta.meta_key === '_menu_item_menu_item_parent';
                                }), 'meta_value'));
                                var existing = navItems_1.filter(function (item) { return (item.id === parentId_1); });
                                if (existing.length) {
                                    existing[0].children.push({ id: post.id, linkedId: linkedId });
                                }
                            }
                            menu_1.items = navItems_1;
                        });
                        return menu_1;
                    }
                    return null;
                });
            }
        };
    };
    return WordExpressDatabase;
}());
exports.WordExpressDatabase = WordExpressDatabase;
