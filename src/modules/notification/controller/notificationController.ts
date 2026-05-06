import { Request, Response } from 'express';
import { messageQueue } from '../../../queue';
import { logger } from '../../../core/logger';
import { QueueJob } from '../../../types';
import { supabase } from '../../../core/config/supabase';
import { v4 as uuidv4 } from 'uuid';

export const sendNotification = async (req: Request, res: Response) => {
  const { channel, to, message } = req.body;
  const projectId = req.project!.project_id;

  logger.info(`Send notification request: project ${projectId}, channel ${channel}, to ${to}`);

  // Validate input
  if (!channel || !to || !message) {
    return res.status(400).json({ error: 'Missing required fields: channel, to, message' });
  }

  if (channel !== 'whatsapp') {
    return res.status(400).json({ error: 'Unsupported channel' });
  }

  try {
    const messageId = uuidv4();

    // Insert message record
    const { error } = await supabase.from('messages').insert({
      id: messageId,
      project_id: projectId,
      channel,
      to_number: to,
      message,
      status: 'pending',
    });

    if (error) {
      logger.error(`DB insert error: ${error}`);
      return res.status(500).json({ error: 'Failed to save message' });
    }

    const job: QueueJob = { id: messageId, projectId, channel, to, message };
    await messageQueue.add('send', job);

    logger.info(`Job added to queue for project ${projectId}`);
    res.status(200).json({ success: true, message: 'Notification queued', messageId });
  } catch (error) {
    logger.error(`Queue error: ${error}`);
    res.status(500).json({ error: 'Failed to queue notification' });
  }
};;