import "@css/Swap.css"
import React, { useEffect, useState } from "react";
import { useWeb3ModalAccount, useWeb3ModalProvider } from "@web3modal/ethers5/react";
import { ethers } from "ethers";

import { tokenData } from "@assets/data";
import { filterByChainId } from "@utils/utils";
import { CoinBadge, CoinBadgeList, SwapForm, TokenSelectionModal } from "@components/index";

function Swap() {
    const { chainId, isConnected } = useWeb3ModalAccount()

    const { walletProvider } = useWeb3ModalProvider()
    const etherProvider = isConnected ? new ethers.providers.Web3Provider(walletProvider) : undefined;

    const tokenList = filterByChainId(tokenData.tokens, chainId ? chainId : 1);

    const [balance, setBalance] = useState(0.00);
    const [isOpen, setIsOpen] = useState(false);
    const [slippage, setSlippage] = useState(5);
    const [tokenInfoOne, setTokenInfoOne] = useState(tokenList[0]);
    const [tokenInfoTwo, setTokenInfoTwo] = useState(tokenList[1]);
    const [inputTokenAmount, setInputTokenAmount] = useState(null);
    const [targetedTokenSelection, setTargetedTokenSelection] = useState(1);

    useEffect(()=>{
        setTokenInfoOne(tokenList[0]);
        setTokenInfoTwo(tokenList[1]);
    }, [chainId])
    
    const swapState = {
        provider: etherProvider,
        isOpen: isOpen,
        setIsOpen: setIsOpen,
        slippage: slippage,
        setSlippage: setSlippage, 
        tokenInfoOne: tokenInfoOne,
        setTokenInfoOne: setTokenInfoOne,
        tokenInfoTwo: tokenInfoTwo, 
        setTokenInfoTwo: setTokenInfoTwo,
        inputTokenAmount: inputTokenAmount,
        setInputTokenAmount: setInputTokenAmount,
        targetedTokenSelection: targetedTokenSelection,
        setTargetedTokenSelection: setTargetedTokenSelection,
        balance: balance,
        setBalance: setBalance
    }
    
    return (
        <div className="swap-wrapper">
            <TokenSelectionModal swapState={swapState} tokenList={tokenList}/>
            <SwapForm swapState={swapState} />
            {/* <CoinBadge token={tokenList[0]}/> */}
            {/* <CoinBadgeList tokenList={[...tokenList.slice(0, 6)]} /> */}
        </div>
    )
}

export default Swap;