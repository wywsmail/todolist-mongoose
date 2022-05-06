const headers = require("./corsHeader");

const errorHandle = (res, message) => {
	res.writeHead(400, headers);
	res.write(
		JSON.stringify({
			status: false,
			message: message
		})
	);
	res.end();
};

module.exports = errorHandle;
