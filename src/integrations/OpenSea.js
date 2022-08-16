import axios from "axios";

// convert to bignumber

class OpenSeaClient {
	constructor(apiKey) {
		this.apiKey = apiKey;
	}

	async getOrder(collection, tokenId) {
		try {
			const { data } = await axios.get(
				//?asset_contract_address=${collection}&token_ids=${tokenId}&limit=${limit}
				"https://api.opensea.io/v2/orders/seaport/listings",
				{
					headers: {
						"X-API-KEY": this.apiKey,
					},
					params: {
						asset_contract_address: collection,
						token_ids: tokenId,
						limit,
					},
				}
			);

			if (!data.success || data.data.length == 0) {
				throw "Order Error";
			}

			return data;
		} catch {}
	}

	async getSlug(address) {
		try {
			const { data } = await axios.get(
				`https://api.opensea.io/api/v1/asset_contract/${address}`,
				{
					headers: {
						"X-API-KEY": this.apiKey,
					},
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
				`https://api.opensea.io/api/v1/collection/${slug}/stats/`,
				{
					headers: {
						"X-API-KEY": this.apiKey,
					},
				}
			);

			return data.stats;
		} catch (err) {
			//
		}
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
