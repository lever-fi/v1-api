import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

const app = express();
const router = express.Router();

router.get("/volume/", async (req, res) => {
	try {
		const { chain, address, time } = req.query;

		res.status(200).send({
			volume: 50.795,
		});
	} catch (err) {
		return res.status(400).send(err?.message || error);
	}
});

router.get("/floor/", async (req, res) => {
	try {
		const { chain, address, time } = req.query;

		res.status(200).send({
			floor: 50.795,
		});
	} catch (err) {
		return res.status(400).send(err?.message || error);
	}
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(router);

app.listen(process.env.PORT || 3000, () => {
	console.log("Server live");
});
