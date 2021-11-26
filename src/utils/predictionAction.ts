import {TfAction} from "../misc/enums/tf-action";
import PredictionActions from "../misc/names/prediction-actions";

export default function predictionAction(number: number) {
    switch (number) {
        case TfAction.NOTHING:
            return PredictionActions.NONE;
        case TfAction.BUY:
            return PredictionActions.BUY;
        case TfAction.SELL:
            return PredictionActions.SELL
    }
}
