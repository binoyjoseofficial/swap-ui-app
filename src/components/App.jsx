import { createWeb3Modal } from '@web3modal/ethers5/react'

// INTERNAL IMPORT
import { modalConfig } from '@config'
import { Header, Swap } from "@components"
import { useWindowSize } from "@utils/resizeHook"

import "@css/App.css"

createWeb3Modal(modalConfig);

function App() {
  const [width, height] = useWindowSize();
  
  return (
    <>
      {/* <div style={{position:"fixed", top:0, right:0}}>{width}</div> */}
      <Header />
      <Swap />
    </>
  )
}

export default App
