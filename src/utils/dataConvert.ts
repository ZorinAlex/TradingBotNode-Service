import * as _ from 'lodash';
import InterfaceDataPriceData from "../misc/interfaces/interface-data-price-data";

export default function convertInputData(hours: Array<Array<number>>): Array<InterfaceDataPriceData> {
    return  _.map(hours, (hourPrice: Array<any>)=>{
        let [timestamp, open, high, low, close, volume] = hourPrice;
        return  {
            timestamp,
            open,
            high,
            low,
            close,
            volume,
            change: (close - open)/open,
            close_off_high: 2*(high - close) / (high - low) - 1,
            volatility: (high - low) / open,
        };
    });
}
