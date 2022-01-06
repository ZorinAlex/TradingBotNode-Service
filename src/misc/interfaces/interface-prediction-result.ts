import {TfActionString} from "../enums/tf-action-string";

export default interface InterfacePredictionResult {
    timestamp: number,
    predictionsArr: Array<number>,
    predictionPercentage: number
    predictionAction: TfActionString
}
