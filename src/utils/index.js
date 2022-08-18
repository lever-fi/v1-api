import { utils, BigNumber } from "ethers";

export const weiToFloat = (num) =>
	parseFloat(utils.formatEther(BigNumber.from(num)));

export const encode = (types, input) =>
	utils.defaultAbiCoder.encode(types, input);
