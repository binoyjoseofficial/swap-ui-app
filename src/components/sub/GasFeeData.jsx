import { Collapse, theme } from 'antd';
import "@css/GasFeeData.css"


function GasFeeData({route}) {

    const header = <div className='gasFeeHeader'>
        <div>1 {route.trade.inputAmount.currency.symbol} = {route.trade.executionPrice.toSignificant(3)} {route.trade.outputAmount.currency.symbol}</div>
        <div>{route.estimatedGasUsedUSD.toSignificant(3)} USD</div>
    </div>

    const content = <div className='gasFeeContent'>
        <div className='gasFeeContentItem'>
            <div>Network Cost</div>
            <div>12.5 USD</div>
        </div>
        <div className='gasFeeContentItem'>
            <div>Slippage</div>
            <div>5 %</div>
        </div>
    </div>

    const getItems = () => [
        {
            key: '1',
            label: header,
            children: content,
            showArrow: false,
        }
    ]

    return (
        <Collapse
            items={getItems()}
            defaultActiveKey={[]}
        />
    )
}

export default GasFeeData;