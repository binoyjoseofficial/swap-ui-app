import { useState, useEffect } from "react";
import { Input, message } from "antd";
import { ArrowDownOutlined, DownOutlined } from "@ant-design/icons";
import { useWeb3ModalAccount } from "@web3modal/ethers5/react";

// internal imports
import { GasFeeData, QuoteLoader, SlippagePopover, SwapLoader, TokenBalance } from "@components/index";
import { estimateGasInUsd, getCurrentNetworkData, isInputANumber } from "@utils/utils";
import { getQuote, approveTransaction, executeSwap } from "@utils/alphaRouter";
import "@css/SwapForm.css"
import { networkData } from "@assets/data";


function SwapForm({ swapState }) {

    const { address, isConnected, chainId } = useWeb3ModalAccount()
    const [messageApi, contextHolder] = message.useMessage();

    const [route, setRoute] = useState(null);
    const [swapStarted, setSwapStarted] = useState(false);
    const [amountout, setAmountOut] = useState(null);
    const [swapBtnContent, setSwapBtnContent] = useState('Swap');
    const [updateBalance, setUpdateBalance] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const currentNetwork = getCurrentNetworkData(networkData, chainId);

    // console.log(currentNetwork)

    const msgApiKey = "Updatable";


    function changeAmount(e) {
        setAmountOut(null);
        setIsLoading(false);
        if (isInputANumber(e.target.value)) {
            swapState.setInputTokenAmount(e.target.value);
        }
    }

    function switchTokens() {
        setAmountOut(null);
        swapState.setInputTokenAmount(null);

        // Switch
        const one = swapState.tokenInfoOne;
        const two = swapState.tokenInfoTwo;
        swapState.setTokenInfoOne(two);
        swapState.setTokenInfoTwo(one);
    }

    function updateTokenBalance() {
        console.log("Updating token balance..")
        setUpdateBalance(!updateBalance);
    }

    function openModal(tokenSelection) {
        swapState.setTargetedTokenSelection(tokenSelection);
        swapState.setIsOpen(true);
    }

    async function handleSwap() {
        setSwapStarted(true)
        setSwapBtnContent("Processing ...")
        if (!route) {
            message.info("Wait till the routing complete")
            setSwapStarted(false)
            setSwapBtnContent("Swap")
            return null;
        }
        try {
            messageApi.open({
                msgApiKey,
                type: 'loading',
                content: 'Approving Transaction.',
            });
            const approval = await approveTransaction(swapState.provider, route, currentNetwork.swapRouter);
            if (!approval) {
                throw Error("Approval Failed !")
            }

            message.destroy(msgApiKey);
            messageApi.open({
                msgApiKey,
                type: 'loading',
                content: 'Executing Swap.',
            });

            const rec = await executeSwap(swapState.provider, route, currentNetwork.swapRouter);

            if (rec) {
                messageApi.open({
                    msgApiKey,
                    type: 'success',
                    content: 'Swap success.',
                });

                updateTokenBalance();
            } else {
                throw Error("Swap Failed.")
            }
        } catch (e) {
            setSwapBtnContent("Swap")
            console.log(e);
            messageApi.open({
                msgApiKey,
                type: 'error',
                content: 'Something went wrong.',
            });
        } finally {
            console.log("Finally")
            updateTokenBalance();
            setRoute(null);
            setSwapStarted(false)
            swapState.setInputTokenAmount(null);
            setAmountOut(null)
            setSwapBtnContent("Swap")
            // upadate balances 
        }
    }

    async function getRoute() {
        setRoute(null);
        setIsLoading(true);
        if (swapState.inputTokenAmount) {
            const _route = await getQuote(
                swapState.provider,
                swapState.tokenInfoOne,
                swapState.tokenInfoTwo,
                swapState.inputTokenAmount,
                swapState.slippage,
                chainId
            );

            setRoute(_route);
            setIsLoading(false);
            setAmountOut(_route.quote.toSignificant(6));
        }
    }

    // When input changed Call Uniswap AlphaRouter
    useEffect(() => {
        getRoute();
    }, [swapState.inputTokenAmount]);

    useEffect(() => {
        swapState.setInputTokenAmount(null);
        setAmountOut(null);
    }, [chainId]);

    // const inputTwoUI = 

    return (
        <div className="swapForm">
            {contextHolder}
            <div className="swapFormHeader">
                <h4>Swap</h4>
                <SlippagePopover slippage={swapState.slippage} setSlippage={swapState.setSlippage} />
            </div>

            <div className="swapFormInputs">

                <div className="inputOneContainer">
                    <Input placeholder="0" value={swapState.inputTokenAmount} onChange={changeAmount} disabled={swapStarted} />
                    {isConnected && address && <TokenBalance swapState={swapState} address={address} update={updateBalance} />}
                </div>

                <div className="inputTwoContainer">
                    <Input placeholder={isLoading && swapState.inputTokenAmount ? "" : "0"} value={swapState.inputTokenAmount ? (amountout ? amountout : null) : null} disabled={true} />
                    {isLoading && swapState.inputTokenAmount && <QuoteLoader />}
                </div>

                <div className="switchButton" onClick={!swapStarted ? switchTokens : null} >
                    <ArrowDownOutlined className="switchArrow" />
                </div>

                <div className="assetOne" onClick={() => openModal(1)}>
                    <img src={swapState.tokenInfoOne.logoURI} alt="assetOneLogo" className="assetLogo" />
                    {swapState.tokenInfoOne.symbol}
                    <DownOutlined />
                </div>

                <div className="assetTwo" onClick={() => openModal(2)} >
                    <img src={swapState.tokenInfoTwo.logoURI} alt="assetOneLogo" className="assetLogo" />
                    {swapState.tokenInfoTwo.symbol}
                    <DownOutlined />
                </div>
            </div>

            <div className="swapBtnContainer">
                <button className="swapButton" disabled={!swapState.inputTokenAmount || swapStarted} onClick={handleSwap}>
                    {swapStarted && <SwapLoader />}
                    {swapBtnContent}
                </button>
            </div>

            {route && <GasFeeData route={route}/>}

            {/* {
                route && <div className="routeData">
                    Slippage: {swapState.slippage}% <br />
                    NetworkCost: {estimateGasInUsd(route)} USD
                </div>
            } */}
        </div>
    );
}

export default SwapForm;