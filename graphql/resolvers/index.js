const postsResolvers = require("./posts");
// const commentsResolvers = require("./comments");

module.exports = {
	Post: {
		likeCount: (parent) => parent.likes.length,
		commentCount: (parent) => parent.comments.length,
	},
	Query: {
		...postsResolvers.Query,
	},

	Mutation: {
		...postsResolvers.Mutation,
		// ...commentsResolvers.Mutation,
	},
};
