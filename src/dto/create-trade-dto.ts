import * as mongoose from "mongoose";
import {EStrategyStates} from "../misc/enums/strategy-states";
import {TfActionString} from "../misc/enums/tf-action-string";

export class CreateTradeDto{
    strategy: mongoose.Schema.Types.ObjectId;
    price: number;
    from: EStrategyStates;
    action: TfActionString
}
