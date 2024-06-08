import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

const API_KEY = process.env.API_KEY;
@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.originalUrl === "/api/healthcheck") {
      return next();
    }
    const requestApiKey = req.headers["x-api-key"];

    if (API_KEY && requestApiKey !== process.env.API_KEY) {
      return res.status(401).json({ message: "Invalid API Key" });
    }
    next();
  }
}
