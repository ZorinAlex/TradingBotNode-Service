import InterfaceDataPriceData from "../misc/interfaces/interface-data-price-data";
import IStrategy from "../interfaces/i-strategy";

export default class StrategyTestDto {
    data?: Array<InterfaceDataPriceData>;
    model: string;
    from: string;
    version: string;
    price: number;
    strategy: string;
    isFromTicker: boolean
}
