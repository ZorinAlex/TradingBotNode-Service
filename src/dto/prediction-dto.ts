import * as mongoose from "mongoose";

export class PredictionDto extends mongoose.Document{
    readonly timestamp: number;
    readonly predictionsArr: Array<number>;
    readonly predictionPercentage: number;
    readonly predictionAction: string;
}
