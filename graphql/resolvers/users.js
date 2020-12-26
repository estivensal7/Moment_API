const { User } = require("../../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server");
const { SECRET_KEY } = require("../../config");
const {
	validateRegisterInput,
	validateLoginInput,
} = require("../../util/inputValidators");
const checkAuth = require("../../util/checkAuth");

const generateToken = (user) => {
	return jwt.sign(
		{
			id: user.id,
			email: user.email,
			username: user.username,
		},
		SECRET_KEY,
		{ expiresIn: "1h" }
	);
};

module.exports = {
	Mutation: {
		async login(_, { username, password }, context, info) {
			const { errors, valid } = validateLoginInput(username, password);

			if (!valid) {
				throw new UserInputError("Errors.", { errors });
			}

			const user = await User.findOne({ username });

			if (!user) {
				errors.general = "User not found.";
				throw new UserInputError("User not found.", { errors });
			}

			const match = await bcrypt.compare(password, user.password);
			if (!match) {
				errors.general = "Invalid credentials.";
				throw new UserInputError("Invalid credentials.", { errors });
			}

			const token = generateToken(user);

			return {
				...user._doc,
				id: user._id,
				token,
			};
		},

		async register(
			_,
			{ registerInput: { username, email, password, confirmPassword } },
			context,
			info
		) {
			//Validate user data
			const { valid, errors } = validateRegisterInput(
				username,
				email,
				password,
				confirmPassword
			);

			if (!valid) {
				throw new UserInputError("Errors", { errors });
			}

			//Make sure user doesn't already exist
			const user = await User.findOne({ username });

			if (user) {
				throw new UserInputError("Username already taken.", {
					errors: {
						username: "This username is already taken.",
					},
				});
			}

			//Hash the password and create an auth token
			password = await bcrypt.hash(password, 12);

			const newUser = new User({
				email,
				username,
				password,
				createdAt: new Date().toISOString(),
			});

			const res = await newUser.save();

			const token = generateToken(res);

			return {
				...res._doc,
				id: res._id,
				token,
			};
		},

		async followUser(_, { currentUserId, userToFollowId }, context) {
			const { username } = checkAuth(context);
			const currentUser = await User.findById(currentUserId);
			const userToFollow = await User.findById(userToFollowId);

			if (currentUser && userToFollow) {
				// Check if curentUser is already following the userToFollow
				if (
					userToFollow.followers.find(
						(follower) => follower.username === username
					)
				) {
					// User already follows this person, unfollow them (remove the current user's username from the userToFollow's followers list)
					userToFollow.followers = userToFollow.followers.filter(
						(follower) => follower.username !== username
					);

					// remove the 'userToFollow' from the currentUser's following list
					currentUser.followings = currentUser.followings.filter(
						(followingUser) =>
							followingUser.username !== userToFollow.username
					);
				} else {
					// userToFollow is not yet followed by the currentUser, follow the userToFollow
					currentUser.followings.push({
						username: userToFollow.username,
						createdAt: new Date().toISOString(),
					});

					// Add the currentUser's username to the userToFollow's followers list
					userToFollow.followers.push({
						username: currentUser.username,
						createdAt: new Date().toISOString(),
					});
				}

				await currentUser.save();
				await userToFollow.save();
				return currentUser;
			} else if (!userToFollow) {
				throw new UserInputError("User to follow not found.");
			} else {
				throw new UserInputError("Authentication error.");
			}
		},
	},
};
