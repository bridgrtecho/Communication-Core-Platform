import { Worker } from 'bullmq';
import dotenv from 'dotenv';
dotenv.config();
import { sendWhatsAppMessage } from '../modules/whatsapp/service/whatsappService';
import { logger } from '../core/logger';
import { QueueJob } from '../types';
import { supabase } from '../core/config/supabase';

const redisUrl = process.env.REDIS_URL!;

const worker = new Worker('messages', async (job) => {
  const { id, projectId, channel, to, message }: QueueJob = job.data;

  logger.info(`Processing job: ${job.id} for channel ${channel}`);

  try {
    if (channel === 'whatsapp') {
      await sendWhatsAppMessage(to, message, { projectId });
    } else {
      logger.error(`Unknown channel: ${channel}`);
    }
  } catch (error) {
    logger.error(`Job failed: ${error}`);
    throw error;
  }
}, {
  connection: redisUrl,
});

worker.on('completed', async (job) => {
  logger.info(`Job ${job.id} completed`);
  const { id } = job.data;
  await supabase.from('messages').update({ status: 'sent' }).eq('id', id);
});

worker.on('failed', async (job, err) => {
  logger.error(`Job ${job?.id} failed: ${err.message}`);
  const { id } = job.data;
  await supabase.from('messages').update({ status: 'failed' }).eq('id', id);
});

export default worker;