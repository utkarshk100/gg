import type { Context } from 'hono';
import { z } from 'zod';

export class HttpError extends Error {
  constructor(
    public status: 400 | 401 | 404 | 409 | 422 | 429 | 500 | 502 | 503,
    message: string,
  ) {
    super(message);
  }
}

/** Reads and validates the JSON body, turning schema errors into a 400 with a readable message. */
export async function parseBody<T extends z.ZodType>(c: Context, schema: T): Promise<z.infer<T>> {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    throw new HttpError(400, 'Malformed JSON body');
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    const issue = result.error.issues[0];
    const where = issue?.path.length ? `${issue.path.join('.')}: ` : '';
    throw new HttpError(400, `${where}${issue?.message ?? 'Invalid request'}`);
  }
  return result.data;
}
