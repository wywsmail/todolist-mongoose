const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const errorHandler = require("./errorHandler");
const successHandler = require("./successHandler");
const Post = require("./models/post");
const headers = require("./corsHeader");

dotenv.config({ path: "./config.env" });
const DB = process.env.DATABASE.replace(
	"<password>",
	process.env.DATABASE_PASSWORD
);
mongoose
	.connect(DB)
	.then(() => {
		console.log("資料庫連線成功");
	})
	.catch((err) => {
		console.log(err.reason);
	});

const requestListener = async (
	req,
	res
) => {
	let body = "";
	req.on("data", (chunk) => {
		body += chunk;
	});
	if (
		req.url === "/posts" &&
		req.method === "GET"
	) {
		const posts = await Post.find();
		successHandler(res, posts);
	} else if (
		req.url === "/posts" &&
		req.method === "POST"
	) {
		req.on("end", async () => {
			try {
				const data = JSON.parse(body);
				const newPost =
					await Post.create({
						content: data.content,
						image: data.image,
						name: data.name,
						likes: data.likes
					});
				successHandler(res, newPost);
			} catch {
				errorHandler(
					res,
					"欄位無正確填寫"
				);
			}
		});
	} else if (
		req.url === "/posts" &&
		req.method === "DELETE"
	) {
		const posts = await Post.deleteMany(
			{}
		);
		successHandler(res, posts);
	} else if (
		req.url.startsWith("/posts/") &&
		req.method === "DELETE"
	) {
		const id = req.url.split("/").pop();
		const posts =
			await Post.findByIdAndDelete(id);
		successHandler(res, posts);
	} else if (
		req.url.startsWith("/posts/") &&
		req.method === "PATCH"
	) {
		req.on("end", async () => {
			try {
				const id = req.url
					.split("/")
					.pop();
				// const index = todos.findIndex(
				// 	(ele) => {
				// 		ele.id === id;
				// 	}
				// );
				const data = JSON.parse(body);
				console.log(data);
				if (data.content !== "") {
					let {
						content,
						image,
						likes
					} = data;
					const posts =
						await Post.findByIdAndUpdate(
							id,
							{
								$set: {
									content,
									image,
									likes
								}
							}
						);
					successHandler(res, posts);
				} else {
					errorHandler(
						res,
						"Content 必填"
					);
				}
			} catch {
				errorHandler(res, "資料錯誤");
			}
		});
	} else if (
		req.url === "/posts" &&
		req.method === "OPTIONS"
	) {
		res.writeHead(200, headers);
		res.end();
	} else {
		errorHandler(
			res,
			"網址錯誤，無此連線"
		);
	}
};

const server = http.createServer(
	requestListener
);

server.listen(process.env.PORT);
