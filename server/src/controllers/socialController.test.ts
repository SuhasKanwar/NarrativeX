import { expect, test } from "bun:test";
import type { Request, Response } from "express";
import { searchSocialHandler } from "./socialController";

test("rejects malformed topics before calling social providers", async () => {
  let statusCode = 0;
  let payload: any;
  const response = {
    status(code: number) { statusCode = code; return this; },
    json(body: any) { payload = body; return this; },
  } as unknown as Response;

  await searchSocialHandler({ body: { topics: ["valid", 42] } } as Request, response);

  expect(statusCode).toBe(400);
  expect(payload.success).toBe(false);
});
