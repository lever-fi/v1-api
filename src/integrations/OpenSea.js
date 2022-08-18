import axios from "axios";
import { encode } from "utils";

const TESTING = true;
const test_host = "testnets-api.opensea.io";
const official_host = "api.opensea.io";

class OpenSeaClient {
	constructor(apiKey) {
		this.hostName = TESTING ? test_host : official_host;
		this.apiKey = apiKey;
	}

	async getOrder(collection, tokenId) {
		try {
			let limit = 1;
			const { data } = await axios.get(
				//?asset_contract_address=${collection}&token_ids=${tokenId}&limit=${limit}
				`https://${this.hostName}/v2/orders/rinkeby/seaport/listings?limit=1`,
				//"https://api.opensea.io/v2/orders/seaport/listings",
				{
					headers: {
						Accept: "application/json",
						//"X-API-KEY": this.apiKey,
					},
					params: {
						asset_contract_address: collection,
						token_ids: tokenId,
						limit,
					},
				}
			);

			if (data.orders.length == 0) {
				throw "Order Error";
			}

			let order = data.orders[0];

			order.price = order?.current_price;
			delete order.current_price;

			return order;
		} catch {}
	}

	async getSlug(address) {
		try {
			const { data } = await axios.get(
				`https://${this.hostName}/api/v1/asset_contract/${address}`,
				{
					/* headers: {
						"X-API-KEY": this.apiKey,
					}, */
				}
			);

			return data.collection.slug;
		} catch (err) {
			//
		}
	}

	async getStats(address) {
		try {
			const slug = await this.getSlug(address);
			const { data } = await axios.get(
				`https://${this.hostName}/api/v1/collection/${slug}/stats/`,
				{
					/* headers: {
						"X-API-KEY": this.apiKey,
					}, */
				}
			);

			data.slug = slug;

			return data.stats;
		} catch (err) {
			//
		}
	}

	encodeOrder(data) {
		let protocolData = data.protocol_data;
		let parameters = protocolData.parameters;
		return encode(
			[
				"tuple(address, uint256, uint256, address, address, address, uint256, uint256, uint8, uint256, uint256, bytes32, uint256, bytes32, bytes32, uint256, tuple(uint256, address)[], bytes)",
				"uint256",
			],
			[
				[
					parameters.consideration[0].token,
					parameters.consideration[0].identifierOrCriteria,
					parameters.totalOriginalConsiderationItems,
					parameters.offerer,
					parameters.zone,
					parameters.offer[0].token,
					parameters.offer[0].identifierOrCriteria,
					parameters.offer[0].startAmount,
					parameters.orderType,
					parameters.startTime,
					parameters.endTime,
					parameters.zoneHash,
					parameters.salt,
					parameters.conduitKey,
					"0x0000000000000000000000000000000000000000000000000000000000000000",
					parameters.consideration.length,
					parameters.consideration.map((item) => {
						return [item.startAmount, item.recipient];
					}),
					protocolData.signature,
				],
				data.price,
			]
		);
	}

	standardizeStats(data) {
		delete data.num_reports;
		return data;
	}

	standardizeVolume(data) {
		return {
			one_day: data.one_day_volume,
			seven_day: data.seven_day_volume,
			thirty_day: data.thirty_day_volume,
			total: data.total_volume,
		};
	}
}

export default OpenSeaClient;

/* 
{
    one_day_volume: 122.30000000000001,
    one_day_change: 0.2731480276615612,
    one_day_sales: 10,
    one_day_average_price: 12.23,
    seven_day_volume: 768.8017899999999,
    seven_day_change: -0.22603742756701736,
    seven_day_sales: 59,
    seven_day_average_price: 13.03053881355932,
    thirty_day_volume: 14717.865395219986,
    thirty_day_change: -0.07863139629239199,
    thirty_day_sales: 819,
    thirty_day_average_price: 17.97053161809522,
    total_volume: 131675.1795983492,
    total_sales: 22452,
    total_supply: 10000,
    count: 10000,
    num_owners: 4994,
    average_price: 5.864741653231302,
    num_reports: 4,
    market_cap: 130305.3881355932,
    floor_price: 12.4
}
*/
