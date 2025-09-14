import { StatusCodes } from "http-status-codes";

const errorHandlerMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || "something went wrong";
  res.status(statusCode).json({ message: message });
};
export default errorHandlerMiddleware;
