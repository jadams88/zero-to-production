import type { Middleware } from 'koa';

// Regex that does a positive lookahead for `Bearer `
const regEx = /(?<=Bearer )(?<token>(.)+)/;

export const bearerToken = (): Middleware => async (ctx, next) => {
  const authHeader = ctx.request.header.authorization || '';
  const token = regEx.exec(authHeader);
  if (token && token.groups) (ctx.request as any).token = token.groups.token;
  return next();
};
