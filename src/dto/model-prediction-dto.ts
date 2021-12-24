import InterfaceDataPriceData from "../misc/interfaces/interface-data-price-data";

export default class ModelPredictionDto {
    data: Array<InterfaceDataPriceData>;
    model: string;
    version: string
}
