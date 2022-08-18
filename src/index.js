import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { BigNumber } from "ethers";

import { OpenSeaClient, LooksRareClient } from "integrations";
import { encode } from "utils";

const app = express();
const router = express.Router();

const openSeaClient = new OpenSeaClient(process.env.OPENSEA_API_KEY);
const looksRareClient = new LooksRareClient(process.env.LOOKSRARE_API_KEY);

const clients = [
	[
		"openSea",
		openSeaClient,
		{
			/* extra params */
		},
	],
	[
		"looksRare",
		looksRareClient,
		{
			/* extra params */
		},
	],
];

router.get("/home/", async (req, res) => {
	res.status(200).send("Working on adding additional support");
});

router.get("/order/", async (req, res) => {
	try {
		let order;
		const { marketplace, collection, tokenId } = req.query;

		if (marketplace) {
			order[clients[marketplace][0]] = await clients[
				marketplace
			][1].getOrder(collection, tokenId);
		} else {
			for (let client of clients) {
				order[client[0]] = await client[1].getOrder(
					collection,
					tokenId
				);
			}
		}

		return res.status(200).send({ order });
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

router.get("/best/order", async (req, res) => {
	try {
		let order = {};
		let prices = [];
		const { collection, tokenId } = req.query;

		for (let client of clients) {
			const orderRes = await client[1].getOrder(collection, tokenId);
			if (orderRes) {
				order[client[0]] = orderRes;
			}
		}

		if (Object.keys(order).length == 0) {
			return res.status(404).send({
				success: false,
				message: "Listing does not exist on compatible marketplaces",
			});
		}

		for (let client of clients) {
			prices.push(
				BigNumber.from(
					order[client[0]]?.price || Number.MAX_SAFE_INTEGER
				)
			);
		}

		const minPrice = Math.min(prices);
		const minIndex = prices.indexOf(minPrice);

		const assetData = encode(
			["tuple(uint256, uint256, uint8)"],
			[[tokenId, minPrice, minIndex]]
		);
		const purchaseData = clients[minIndex][1].encode(
			order[clients[minIndex][0]]
		);

		return res.status(200).send({
			assetData,
			purchaseData,
			marketplace: clients[minIndex][0],
			order: order[clients[minIndex][0]],
		});
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
	//console.log(looksRareClient.encode(lrOrder))
	//
	/* const osOrder = await openSeaClient.getOrder(
		"0x0db7b821f5047ed6685ac25b30c0cfe9364e1f8d",
		49
	);
	console.log(openSeaClient.encode(osOrder.orders[0])); */
	//
	/* const osStats = await openSeaClient.getStats(address);
	const lrStats = await looksRareClient.getStats(address);

	console.log("OPENSEA");
	console.log(openSeaClient.standardizeStats(osStats));
	console.log("\nLOOKSRARE");
	console.log(looksRareClient.standardizeStats(lrStats)); */
	//const stats = await openseaClient.getStats(address);
	//console.log(stats); */

	let order = {};
	let prices = [];
	const collection = "0x0dB7b821f5047eD6685aC25B30c0CFe9364E1f8d";
	const tokenId = 49;
	for (let client of clients) {
		order[client[0]] = await client[1].getOrder(collection, tokenId);
	}

	for (let client of clients) {
		prices.push(
			parseFloat(order[client[0]]?.price || Number.MAX_SAFE_INTEGER)
		);
	}

	let minPrice = Math.min(...prices);
	const minIndex = prices.indexOf(minPrice);
	minPrice = BigNumber.from(minPrice.toString());

	console.log(minPrice, minIndex);

	const assetData = encode(
		["tuple(uint256, uint256, uint8)"],
		[[tokenId, minPrice, minIndex]]
	);
	const purchaseData = clients[minIndex][1].encodeOrder(
		order[clients[minIndex][0]]
	);

	console.log({
		assetData,
		purchaseData,
		marketplace: clients[minIndex][0],
		order: order[clients[minIndex][0]],
	});
};

main("0x8a90cab2b38dba80c64b7734e58ee1db38b8992e");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(router);

app.listen(process.env.PORT || 3000, () => {
	console.log("Server live");
});
