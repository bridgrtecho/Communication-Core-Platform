import { Request, Response } from 'express';
import axios from 'axios';
import { logger } from '../../../core/logger';
import { MetaWebhookPayload } from '../../../types/metaWebhook';
import {
  findProjectByPhoneNumberId,
  findProjectByWabaNumber,
  ProjectWebhookTarget,
} from '../../project/service/projectService';
import {
  extractRoutingKeys,
  isMetaWhatsAppWebhook,
} from './metaWebhookParser';
import { verifyMetaWebhookSignature } from './webhookSignature';

const resolveProjectTargets = async (
  payload: MetaWebhookPayload,
): Promise<ProjectWebhookTarget[]> => {
  const { phoneNumberIds, displayPhoneNumbers } = extractRoutingKeys(payload);
  const targets = new Map<string, ProjectWebhookTarget>();

  for (const phoneNumberId of phoneNumberIds) {
    const project = await findProjectByPhoneNumberId(phoneNumberId);
    if (project) {
      targets.set(project.callback_url, project);
    }
  }

  if (targets.size === 0) {
    for (const displayPhone of displayPhoneNumbers) {
      const project = await findProjectByWabaNumber(displayPhone);
      if (project) {
        targets.set(project.callback_url, project);
      }
    }
  }

  return [...targets.values()];
};

export const verifyWebhook = (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || process.env.WHATSAPP_VERIFY_TOKEN;

  if (!verifyToken) {
    logger.error('WHATSAPP_WEBHOOK_VERIFY_TOKEN or WHATSAPP_VERIFY_TOKEN is not configured');
    return res.status(500).send('Webhook verify token not configured');
  }

  if (mode === 'subscribe' && token === verifyToken && challenge) {
    logger.info('Meta webhook verification succeeded');
    return res.status(200).send(String(challenge));
  }

  logger.error('Meta webhook verification failed');
  return res.sendStatus(403);
};

export const handleWebhook = async (req: Request, res: Response) => {
  if (!verifyMetaWebhookSignature(req)) {
    logger.error('Meta webhook signature verification failed');
    return res.sendStatus(403);
  }

  const payload = req.body;

  if (!isMetaWhatsAppWebhook(payload)) {
    logger.error(`Unsupported webhook payload: ${JSON.stringify(payload)}`);
    return res.status(400).json({ error: 'Invalid Meta WhatsApp webhook payload' });
  }

  logger.info(`Meta webhook received: ${JSON.stringify(payload)}`);

  try {
    const targets = await resolveProjectTargets(payload);

    if (targets.length === 0) {
      const { phoneNumberIds, displayPhoneNumbers } = extractRoutingKeys(payload);
      logger.error(
        `No project found for phone_number_id=[${phoneNumberIds.join(', ')}] waba=[${displayPhoneNumbers.join(', ')}]`,
      );
      return res.sendStatus(200);
    }

    const results = await Promise.allSettled(
      targets.map((target) => axios.post(target.callback_url, payload, { timeout: 10000 })),
    );

    results.forEach((result, index) => {
      const target = targets[index];
      if (result.status === 'fulfilled') {
        logger.info(`Webhook forwarded to ${target.callback_url} (project ${target.project_id})`);
      } else {
        logger.error(
          `Failed to forward webhook to ${target.callback_url} (project ${target.project_id}): ${result.reason}`,
        );
      }
    });

    return res.sendStatus(200);
  } catch (error) {
    logger.error(`Webhook processing error: ${error}`);
    return res.sendStatus(200);
  }
};
