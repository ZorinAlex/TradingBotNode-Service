import * as mongoose from 'mongoose'

const PredictionSchema = new mongoose.Schema({
    timestamp: String,
    predictionsArr: [Number],
    predictionPercentage: Number,
    predictionAction: String
}, {timestamps: true});

export default PredictionSchema
