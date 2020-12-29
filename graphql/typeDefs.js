const { gql } = require("apollo-server");

module.exports = gql`
	type Post {
		id: ID!
		body: String!
		createdAt: String!
		username: String!
		comments: [Comment]!
		likes: [Like]!
		likeCount: Int!
		commentCount: Int!
	}

	type Comment {
		id: ID!
		createdAt: String!
		username: String!
		body: String!
	}

	type Like {
		id: ID!
		createdAt: String!
		username: String!
	}

	type User {
		id: ID!
		email: String!
		token: String!
		username: String!
		createdAt: String!
		followings: [Following]
		followers: [Follower]
		followingsCount: Int!
		followersCount: Int!
	}

	type Following {
		username: String!
		createdAt: String!
	}

	type Follower {
		username: String!
		createdAt: String!
	}

	input RegisterInput {
		username: String!
		password: String!
		confirmPassword: String!
		email: String!
		privacyStatus: String!
	}

	type Query {
		getPostsByUser(username: String!): [Post]
		getAllPosts: [Post]
		getPost(postId: ID!): Post
		getTimeline: [Post]
		getCurrentUserDetails: User!
		getUserDetailsByUsername(username: String!): User
		getFollowings: [Following]
		getFollowers: [Follower]
	}

	type Mutation {
		register(registerInput: RegisterInput): User!
		login(username: String!, password: String!): User!
		createPost(body: String!): Post!
		deletePost(postId: ID!): String!
		createComment(postId: ID!, body: String!): Post!
		deleteComment(postId: ID!, commentId: ID!): Post!
		likePost(postId: ID!): Post!
		followUser(userToFollowId: ID!): User!
		changePrivacyStatus: User!
	}
`;
