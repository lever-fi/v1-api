import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import axios from "axios";

import { OpenSeaClient, LooksRareClient } from "./integrations";

const app = express();
const router = express.Router();

const openSeaClient = new OpenSeaClient(process.env.OPENSEA_API_KEY);
const looksRareClient = new LooksRareClient();

router.get("/home/", async (req, res) => {
	res.status(200).send("Currently only supporting /volume and /floor");
});

router.get("/order/", async (req, res) => {
	try {
		let order;
		const { marketplace, collection, tokenId } = req.query;
		switch (marketplace) {
			case "OPENSEA":
				break;
			case "LOOKSRARE":
				order = await looksRareClient.getOrder(collection, tokenId);
				break;
			default:
				break;
		}

		res.status(200).send({ order });
	} catch (err) {
		return res.status(400).send(err?.message || error);
	}
});

router.get("/stats/", async (req, res) => {
	try {
		const { chain, address, time } = req.query;
		const stats = await openseaClient.getStats(address);

		res.status(200).send(stats);
	} catch (err) {
		return res.status(400).send(err?.message || error);
	}
});

router.get("/volume/", async (req, res) => {
	try {
		const { chain, address, time } = req.query;
		const stats = await openseaClient.getStats(address);

		res.status(200).send(openseaClient.standardizeVolume(stats));
	} catch (err) {
		return res.status(400).send(err?.message || error);
	}
});

router.get("/floor/", async (req, res) => {
	try {
		const { chain, address, time } = req.query;
		const stats = await openseaClient.getStats(address);

		res.status(200).send(stats.floor_price);
	} catch (err) {
		return res.status(400).send(err?.message || error);
	}
});

const main = async (address) => {
	/* const lrOrder = await looksRareClient.getOrder(
		"0x104Edd8aABf30bDCc96252edb80aef9Fcb69fdD5",
		"1",
		true
	);

	console.log(lrOrder); */
	const osStats = await openSeaClient.getStats(address);
	const lrStats = await looksRareClient.getStats(address);

	console.log("OPENSEA");
	console.log(openSeaClient.standardizeStats(osStats));
	console.log("\nLOOKSRARE");
	console.log(looksRareClient.standardizeStats(lrStats));
	//const stats = await openseaClient.getStats(address);
	//console.log(stats); */
};

main("0x8a90cab2b38dba80c64b7734e58ee1db38b8992e");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(router);

app.listen(process.env.PORT || 3000, () => {
	console.log("Server live");
});
