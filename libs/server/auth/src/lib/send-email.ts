import sgMail from '@sendgrid/mail';
import { EmailVerificationConfig } from './auth.interface';

export function configureSendGridEmail({
  sendGridApiKey,
  authServerUrl,
}: EmailVerificationConfig) {
  // Set the api key
  sgMail.setApiKey(sendGridApiKey);

  return (to: string, token: string) => {
    const msg = {
      to,
      from: 'register@zero-to-production.com',
      subject: 'Verify Your Email',
      text: `Click on the link to verify your email ${authServerUrl}/authorize/verify?token=${token}&email=${to}`,
    };
    return sgMail.send(msg);
  };
}
