import crypto from 'crypto';
import { Request } from 'express';

const SIGNATURE_PREFIX = 'sha256=';

export const verifyMetaWebhookSignature = (req: Request): boolean => {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) return true;

  const signature = req.get('x-hub-signature-256');
  const rawBody = req.rawBody;

  if (!signature?.startsWith(SIGNATURE_PREFIX) || !rawBody) {
    return false;
  }

  const expected = crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
  const received = signature.slice(SIGNATURE_PREFIX.length);

  if (expected.length !== received.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
};
