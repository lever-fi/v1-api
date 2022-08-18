import axios from "axios";
import { utils, BigNumber } from "ethers";
import { weiToFloat, encode } from "utils";
/* import {
	signMakerOrder,
	addressesByNetwork,
	SupportedChainId,
} from "@looksrare/sdk"; */

class LooksRareClient {
	constructor(apiKey) {
		this.apiKey = apiKey;
	}

	format(num) {
		return parseFloat(utils.formatEther(BigNumber.from(num)));
	}

	async getOrder(collection, tokenId, isOrderAsk = true) {
		try {
			const { data } = await axios.get(
				//?isOrderAsk=${isOrderAsk}&collection=${collection}&tokenId=${tokenId}&status%5B%5D=VALID&pagination%5Bfirst%5D=1&sort=NEWEST
				"https://api-rinkeby.looksrare.org/api/v1/orders",
				{
					params: {
						isOrderAsk,
						collection,
						tokenId,
						"status[]": "VALID",
						"pagination[first]": 1,
						sort: "NEWEST",
					},
				}
			);

			if (!data.success || data.data.length == 0) {
				throw "Order Error";
			}

			return data.data[0];
		} catch {}
	}

	async getStats(address) {
		try {
			const { data } = await axios.get(
				`https://api.looksrare.org/api/v1/collections/stats?address=${address}`
				/* {
					headers: {
						"X-API-KEY": process.env.LOOKSRARE_API_KEY,
					},
				} */
			);

			if (!data.success) {
				throw data.message;
			}

			return data.data;
		} catch (err) {
			//
		}
	}

	encodeOrder(data) {
		return encode(
			[
				"tuple(bool, address, address, uint256, uint256, uint256, address, address, uint256, uint256, uint256, uint256, bytes, uint8, bytes32, bytes32)",
			],
			[
				[
					true,
					data.signer,
					data.collectionAddress,
					data.price,
					data.tokenId,
					data.amount,
					data.strategy,
					data.currencyAddress,
					data.nonce,
					data.startTime,
					data.endTime,
					data.minPercentageToAsk,
					JSON.parse(data.params === "" ? "[]" : data.params),
					data.v,
					data.r,
					data.s,
				],
			]
		);
	}

	standardizeStats(data) {
		return {
			one_day_volume: data.volume24h || 0,
			one_day_change: data.change24h || 0,
			one_day_sales: data.count24h || 0,
			one_day_average_price: data.average24h || 0,
			seven_day_volume: this.format(data.volume7d) || 0,
			seven_day_change: data.change7d || 0,
			seven_day_sales: data.count7d || 0,
			seven_day_average_price: this.format(data.average7d) || 0,
			thirty_day_volume: this.format(data.volume1m) || 0,
			thirty_day_change: data.change1m || 0,
			thirty_day_sales: data.count1m || 0,
			thirty_day_average_price: this.format(data.average1m) || 0,
			total_volume: this.format(data.volumeAll),
			total_sales: data.countAll,
			total_supply: data.totalSupply,
			count: data.totalSupply,
			num_owners: data.countOwners,
			average_price: this.format(data.averageAll),
			market_cap: this.format(
				BigNumber.from(data.averageAll).mul(data.totalSupply).toString()
			),
			floor_price: this.format(data.floorPrice),
		};
	}

	standardizeVolume(data) {
		return {};
	}
}

export default LooksRareClient;

/* 
{
    address: '0x8a90CAb2b38dba80c64b7734e58Ee1dB38B8992e',
    countOwners: 5015,
    totalSupply: 10000,
    floorPrice: '12700000000000000000',
    floorChange24h: 0,
    floorChange7d: 6.722689075630251,
    floorChange30d: -39.52380952380952,
    marketCap: '127000000000000000000000',
    volume24h: '0',
    average24h: '0',
    count24h: 0,
    change24h: null,
    volume7d: '61650000000000000000',
    average7d: '12330000000000000000',
    count7d: 5,
    change7d: -62.44016471495648,
    volume1m: '2330463879179900000000',
    average1m: '15640697175704026846',
    count1m: 149,
    change1m: -60.6110910302984,
    volume3m: '9737513319179900000000',
    average3m: '17965891732804243542',
    count3m: 542,
    change3m: 214.6209829669457,
    volume6m: '12832511379179900000000',
    average6m: '16536741468015335052',
    count6m: 776,
    change6m: 100,
    volume1y: '12832511379179900000000',
    average1y: '16536741468015335052',
    count1y: 776,
    change1y: 100,
    volumeAll: '12832511379179900000000',
    averageAll: '16536741468015335052',
    countAll: 776
} 
*/
