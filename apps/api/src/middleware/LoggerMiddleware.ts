import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger(`HTTP`);

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    // Listen for the response to finish
    res.on("finish", () => {
      const duration = Date.now() - startTime;
      this.logger.log(
        `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
      );
    });

    next();
  }
}
