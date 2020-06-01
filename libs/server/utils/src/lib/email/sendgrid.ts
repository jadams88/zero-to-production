import { setApiKey, send, MailDataRequired } from '@sendgrid/mail';

export function configureSendgrid(apiKey: string) {
  // Set the api key
  setApiKey(apiKey);

  return async (msg: MailDataRequired) => send(msg);
}
