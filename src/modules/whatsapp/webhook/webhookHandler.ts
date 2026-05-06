import { Request, Response } from 'express';
import axios from 'axios';
import { supabase } from '../../../core/config/supabase';
import { logger } from '../../../core/logger';

export const handleWebhook = async (req: Request, res: Response) => {
  const payload = req.body;
  logger.info(`Webhook received: ${JSON.stringify(payload)}`);

  // Extract "to" number - assuming payload has 'to' field
  const to = payload.to;
  if (!to) {
    logger.error('Webhook payload missing "to" field');
    return res.status(400).json({ error: 'Invalid payload' });
  }

  try {
    // Query projects where waba_number = to
    const { data, error } = await supabase
      .from('projects')
      .select('callback_url')
      .eq('waba_number', to)
      .single();

    if (error || !data) {
      logger.error(`No project found for waba_number: ${to}`);
      return res.status(404).json({ error: 'Project not found' });
    }

    const callbackUrl = data.callback_url;
    // Forward payload using Axios
    await axios.post(callbackUrl, payload);
    logger.info(`Webhook forwarded to ${callbackUrl}`);
    res.status(200).json({ success: true });
  } catch (error) {
    logger.error(`Webhook error: ${error}`);
    res.status(500).json({ error: 'Internal server error' });
  }
};