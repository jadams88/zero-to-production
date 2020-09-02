import { IncomingMessage, ServerResponse } from 'http';
import { Context, Next } from 'koa';
import {
  contentSecurityPolicy,
  dnsPrefetchControl,
  expectCt,
  frameguard,
  hidePoweredBy,
  hsts,
  ieNoOpen,
  noSniff,
  permittedCrossDomainPolicies,
  referrerPolicy,
  xssFilter,
} from 'helmet';

type Middleware = (
  arg1: IncomingMessage,
  arg2: ServerResponse,
  next: () => void
) => void;

export interface Options {
  contentSecurityPolicy?: Parameters<typeof contentSecurityPolicy>[0] | false;
  dnsPrefetchControl?: Parameters<typeof dnsPrefetchControl>[0] | false;
  expectCt?: Parameters<typeof expectCt>[0] | false;
  frameguard?: Parameters<typeof frameguard>[0] | false;
  hidePowered?: false;
  hsts?: Parameters<typeof hsts>[0] | false;
  ieNoOpen?: false;
  noSniff?: false;
  permittedCrossDomainPolicies?:
    | Parameters<typeof permittedCrossDomainPolicies>[0]
    | false;
  referrerPolicy?: Parameters<typeof referrerPolicy>[0] | false;
  xssFilter?: false;
}

export function helmet(opts: Options = {} as Options) {
  const middleware: Middleware[] = [];

  if (
    opts.contentSecurityPolicy !== false &&
    opts.contentSecurityPolicy !== undefined
  ) {
    middleware.push(contentSecurityPolicy(opts.contentSecurityPolicy));
  }

  if (opts.dnsPrefetchControl !== false)
    middleware.push(dnsPrefetchControl(opts.dnsPrefetchControl));

  if (opts.expectCt !== false) middleware.push(expectCt(opts.expectCt));

  if (opts.frameguard !== false) middleware.push(frameguard(opts.frameguard));

  if (opts.hidePowered !== false) middleware.push(hidePoweredBy());

  if (opts.hsts !== false) middleware.push(hsts(opts.hsts));

  if (opts.ieNoOpen !== false) middleware.push(ieNoOpen());

  if (opts.noSniff !== false) middleware.push(noSniff());

  if (opts.permittedCrossDomainPolicies !== false)
    middleware.push(
      permittedCrossDomainPolicies(opts.permittedCrossDomainPolicies)
    );

  if (opts.referrerPolicy !== false)
    middleware.push(referrerPolicy(opts.referrerPolicy));

  if (opts.xssFilter !== false) middleware.push(xssFilter());

  function nextHandler(err?: Error) {
    if (err) throw err;
  }

  return (ctx: Context, next: Next) => {
    for (let i = 0; i < middleware.length; i++) {
      middleware[i](ctx.req, ctx.res, nextHandler);
    }
    return next();
  };
}
