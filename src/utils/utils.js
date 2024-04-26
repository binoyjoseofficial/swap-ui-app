import { ethers } from "ethers";

// Check whether given input a number
export function isInputANumber(value){
    if (!isNaN(Number(value))) {
        return true;
    } else {
        return false;
    }
}

export const shortenAddress = (address) => `${address?.slice(0, 4)}..${address?.slice(address.length - 3)}`;

export function filterByChainId(data, targetChainId) {
    return data.filter(item => item.chainId === targetChainId);
}

export function getCurrentNetworkData(data, targetChainId) {
    return data.find(obj => obj.chainId === targetChainId);
}

export function getTokenFromSearch(data, input) {
    const search = input.toLowerCase();

    return data.filter(
        obj => {
            const name = obj.name.toLowerCase()
            const symbol = obj.symbol.toLowerCase()
            const address = obj.address.toLowerCase()
            return name.includes(search) || symbol.includes(search) || address == search;
        }
    )
}

export async function getNetworkBalance(walletProvider) {
    if(!walletProvider) return null;
    const provider = new ethers.providers.Web3Provider(walletProvider);
    const signer = provider.getSigner();

    const balHex =  await signer.getBalance();
    const balance = parseFloat(ethers.utils.formatUnits(balHex)).toFixed(3);

    return balance;
}

export const estimateGasInUsd = (route) => {
    const bigN = (route.estimatedGasUsedUSD.numerator / route.estimatedGasUsedUSD.denominator);
    const dai = ethers.utils.formatUnits(bigN.toString(), 18);

    return parseFloat(dai).toFixed(2)
}
