const { ApolloServer } = require("apollo-server");
const mongoose = require("mongoose");

// Config Imports
const { MONGODB_URI } = require("./config");

// GraphQL Imports
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");

// Initializing Apollo Server
const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: ({ req }) => ({ req }),
});

// Connecting to MongoDB -> Starting Express server
mongoose
	.connect(MONGODB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log("Connected to MongoDB.");
		return server.listen({ port: 5000 });
	})
	.then((res) => {
		console.log(`Server running at: ${res.url}`);
	});
