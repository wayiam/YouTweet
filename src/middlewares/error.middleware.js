import mongoose
from "mongoose";
import { apiError } from "../utils/apiError.js";


const errorHandler = (err, req, res, next) => {

    let error = err;

    if (!(err instanceof apiError)) {
        const statusCode = err.statusCode || err instanceof mongoose.Error ? 400 : 500;

        const messsage = error.message || "Something went wrong"
        error = new apiError(statusCode, messsage, error?.errors || [],  err.stack);
    }

	const response =  {
		...error,
		message: error.message,
		...(process.env.NODE_ENV === 'development') ? {stack:error.stack}:{}
	}


	return res.status(error.statusCode).json(response)
}


export { errorHandler }