import { AlphaRouter, SwapType } from '@uniswap/smart-order-router'
import { Token, CurrencyAmount, TradeType } from '@uniswap/sdk-core'
import { JSBI, Percent } from "@uniswap/sdk";
import { ethers, BigNumber } from "ethers";

import { ERC20Fetch } from './ERC20Fetch';
import { TokenAmountHelper } from './TokenAmountHelper';

// const JSON_RPC_SEPOLIA_PROVIDER = "https://eth-sepolia.g.alchemy.com/v2/2a0i6ZcDfbzQntPgOjSGz9glz36Xbgqd"

export async function getQuote(provider, token1, token2, amountIn, slippage, chainId) {

    // console.log(slippage, typeof slippage)

    const signer = provider.getSigner();
    const address = await signer.getAddress();


    // const jSONRPVPROVIDER = new ethers.providers.JsonRpcProvider(JSON_RPC_SEPOLIA_PROVIDER);

    const _chainId = chainId;
    console.log(`${token1.symbol} to ${token2.symbol} in chainId: ${_chainId}`)
    const router = new AlphaRouter({ chainId: _chainId, provider: provider });
    const TOKEN_1 = new Token(
        router.chainId,
        ethers.utils.getAddress(token1.address),
        token1.decimals,
        token1.symbol,
        token1.name
    );

    const TOKEN_2 = new Token(
        router.chainId,
        ethers.utils.getAddress(token2.address),
        token2.decimals,
        token2.symbol,
        token2.name
    );

    const typedValueParsed = TokenAmountHelper.convertToBigIntString(amountIn, token1.decimals);
    const tokenInAmount = CurrencyAmount.fromRawAmount(TOKEN_1, JSBI.BigInt(typedValueParsed));

    console.log("Routing....");

    const route = await router.route(
        tokenInAmount,
        TOKEN_2,
        TradeType.EXACT_INPUT,
        {
            type: SwapType.SWAP_ROUTER_02,
            recipient: address,
            slippageTolerance: new Percent(slippage, 100),
            deadline: Math.floor(Date.now() / 1000 + 1800)
        }
    );



    // console.log(route.quote.toSignificant(6))
    // console.log(route.methodParameters.calldata)
    // console.log()
    console.log(route)
    // console.log()
    // console.log("Gas Price (ETH) :", ethers.utils.formatUnits(route.gasPriceWei.toString(), 18))
    // console.log("Estimated Gas Usage (ETH):", ethers.utils.formatUnits(route.estimatedGasUsed.toString(), 18))

    // console.log(route.trade.inputAmount.currency.address);
    // console.log(route.trade.outputAmount.currency.address);
    // console.log(route.trade.inputAmount.numerator / route.trade.inputAmount.denominator);

    // console.log(r);

    

    return route;

}

export async function approveTransaction(provider, route, swapRouterAddress){
    const signer = await provider.getSigner();

    // APPROVE ERC20
    const tokenInAddress = route.trade.inputAmount.currency.address;
    const owner = await signer.getAddress();
    const amount = (route.trade.inputAmount.numerator / route.trade.inputAmount.denominator).toString()

    console.log(amount)

    const approval = await ERC20Fetch.approve(signer, tokenInAddress, owner, swapRouterAddress, amount);
    return approval;
}

export async function executeSwap(provider, route, swapRouterAddress) {


    // const provvv = new ethers.providers.JsonRpcProvider(JSON_RPC_SEPOLIA_PROVIDER);

    // console.log(provider, route, swapRouterAddress)
    const signer = await provider.getSigner();
    const owner = await signer.getAddress();

    var nc = await signer.getTransactionCount();

    const Txn = {
        data: route.methodParameters.calldata,
        nonce: nc,
        to: swapRouterAddress,
        value: BigNumber.from(0),
        from: owner,
        gasPrice: BigNumber.from(route.gasPriceWei),
        gasLimit: BigNumber.from(route.estimatedGasUsed).add(BigNumber.from("100000")),
    }

    // const gasEstimate = await provider.estimateGas(Txn);

    // console.log(gasEstimate);

    const TxnResponse = await signer.sendTransaction(Txn);
    const receipt = await TxnResponse.wait();

    console.log("Transaction Done");
    console.log("Transaction reciept status", receipt.status);    
    // console.log("Transaction hash:", receipt.transactionHash);
    // console.log("Gas used (ETH):", ethers.utils.formatUnits(receipt.gasUsed.toString(), 18));
    // console.log("Estimate + Addon Gas:", ethers.utils.formatUnits((BigNumber.from(route.estimatedGasUsed).add(BigNumber.from("100000"))).toString(), 18));
    
    return receipt.status == 1 ? true : false;
    // console.log("Input token Balance", (await ERC20Fetch.balanceOf(provider, tokenInAddress, owner)).toString());
    // console.log("Output token balance", (await ERC20Fetch.balanceOf(provider, tokenOutAddress, owner)).toString());


}