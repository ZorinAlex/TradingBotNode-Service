import InterfaceDataPriceData from "../misc/interfaces/interface-data-price-data";

export default class StrategyTestDto {
    data?: Array<InterfaceDataPriceData>;
    model: string;
    from: string;
    version: string;
    price: number;
    strategy: string;
    isFromTicker: boolean
}
