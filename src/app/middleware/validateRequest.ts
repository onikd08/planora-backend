import { NextFunction, Request, Response } from "express";
import z from "zod";

export default function validateRequest(zodSchema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }

    const result = zodSchema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      next(result.error);
    } else {
      const data = result.data as any;
      if (data.body) req.body = data.body;
      if (data.query) req.query = data.query;
      if (data.params) req.params = data.params;

      next();
    }
  };
}
