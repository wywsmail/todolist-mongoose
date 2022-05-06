const headers = require("./corsHeader");

const successHandler = (res, posts) => {
	res.writeHead(200, headers);
	res.write(
		JSON.stringify({
			status: "success",
			posts
		})
	);
	res.end();
};

module.exports = successHandler;
