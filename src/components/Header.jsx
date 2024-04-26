import { useEffect, useState } from "react";
import { useWalletInfo, useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider } from "@web3modal/ethers5/react";

import { networkData } from "@assets/data";
import { useWindowSize } from "@utils/resizeHook";
import { getCurrentNetworkData, getNetworkBalance, shortenAddress } from "@utils/utils";
// import DesktopLogo from "@assets/images/desktop_logo.svg"
// import MobileLogo from "@assets/images/mobile_logo.svg"
import AccumulateLogo from "@assets/images/accumulate_logo.jpeg";
import "@css/Header.css"

function Header() {

    // const [width, height] = useWindowSize();
    const [networkBalance, setNetworkBalance] = useState(0);
    // const [currentNetwork, setCurrentNetwork] = useState(null);

    const { walletInfo } = useWalletInfo()
    const { address, chainId, isConnected } = useWeb3ModalAccount()
    const { walletProvider } = useWeb3ModalProvider()
    const { open, close } = useWeb3Modal()

    // const logo = width > 750 ? DesktopLogo : MobileLogo;

    // FUNCTIONS
    const onClickWallet = () => {
        isConnected ? open({ view: 'Account' }) : open({ view: 'Connect' });
    }

    const onClickNetwork = () => {
        isConnected ? open({ view: 'Networks' }) : null;
    }

    const currentNetwork = getCurrentNetworkData(networkData, chainId);

    useEffect(()=>{
        // const data = 

        // setCurrentNetwork(data);

        getNetworkBalance(walletProvider).then(
            bal => setNetworkBalance(bal)
        );
    }, [chainId]);

    return (
        <header>
            <div className="logo">
                <img src={AccumulateLogo} alt="AccumulateSwap" />
            </div>
            <div className="connectionStatus">
                {
                    !isConnected ? null :
                        <button onClick={onClickNetwork}>
                            <div className="networkData">
                                <img src={currentNetwork?.imageURI} alt={currentNetwork?.name} />
                                <div>{networkBalance} {currentNetwork?.symbol}</div>
                            </div>
                        </button>
                }

                <button onClick={onClickWallet}>
                    {
                        !isConnected ? "Connect Wallet" :
                            <div className="walletData">
                                <img src={walletInfo.icon} alt={walletInfo.name} />
                                <div>{shortenAddress(address)}</div>
                            </div>
                    }
                </button>
            </div>
        </header>
    )
}

export default Header;