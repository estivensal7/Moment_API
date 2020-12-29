const { AuthenticationError } = require("apollo-server");
const { User } = require("../models/");

module.exports = (currentUser, requestedUser) => {
	const { username } = currentUser;
	const { privacyStatus } = requestedUser;

	let authorizeData = false;

	if (privacyStatus === "private") {
		//IF privacyStatus === private then check if the currentUser is following the user we are requesting data on
		if (
			requestedUser.followers.find(
				(follower) => follower.username === username
			)
		) {
			authorizeData = true;
		} else {
			authorizeData = false;
		}
	}

	//IF privacyStatus === public return true
	if (privacyStatus === "public") {
		authorizeData = true;
	}

	return authorizeData;
};
