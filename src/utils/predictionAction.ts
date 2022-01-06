import {TfAction} from "../misc/enums/tf-action";
import {TfActionString} from "../misc/enums/tf-action-string";

export default function predictionAction(number: number): TfActionString {
    switch (number) {
        case TfAction.NOTHING:
            return TfActionString.NONE;
        case TfAction.BUY:
            return TfActionString.BUY;
        case TfAction.SELL:
            return TfActionString.SELL
    }
}
