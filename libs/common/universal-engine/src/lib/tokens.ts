import { InjectionToken } from '@angular/core';
import { Request, Response } from 'koa';

export const REQUEST = new InjectionToken<Request>('REQUEST');
export const RESPONSE = new InjectionToken<Response>('RESPONSE');
