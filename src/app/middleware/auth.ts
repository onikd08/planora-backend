import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import AppError from "../errorHelpers/AppError";
import catchAsync from "../shared/catchAsync";
import jwtUtils from "../utils/jwt";
import envVars from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

const auth = (...requiredRoles: string[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    // check if the token is missing
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized!");
    }

    // verify token
    const verifiedUser = jwtUtils.verifyToken(
      token,
      envVars.ACCESS_TOKEN_SECRET,
    );

    if (!verifiedUser.success || !verifiedUser.data) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid Token");
    }

    const { role } = verifiedUser.data as JwtPayload;

    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw new AppError(httpStatus.FORBIDDEN, "Forbidden access");
    }

    req.user = verifiedUser.data as JwtPayload;

    next();
  });
};

export default auth;
