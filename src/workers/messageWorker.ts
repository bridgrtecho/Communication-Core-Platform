import { Worker } from 'bullmq';
import dotenv from 'dotenv';
dotenv.config();
import { sendWhatsAppMessage } from '../modules/whatsapp/service/whatsappService';
import { fetchProjectWhatsAppCredentials } from '../modules/project/service/projectService';
import { logger } from '../core/logger';
import { QueueJob } from '../types';
import { supabase } from '../core/config/supabase';
import { redisConnection } from '../core/config/redis';

const worker = new Worker('messages', async (job) => {
  const { id, projectId, channel, to, message }: QueueJob = job.data;

  logger.info(`Processing job: ${job.id} for channel ${channel}`);

  try {
    if (channel === 'whatsapp') {
      const credentials = await fetchProjectWhatsAppCredentials(projectId);
      if (!credentials) {
        throw new Error(`WhatsApp credentials not found for project ${projectId}`);
      }
      await sendWhatsAppMessage(to, message, credentials);
    } else {
      logger.error(`Unknown channel: ${channel}`);
    }
  } catch (error) {
    logger.error(`Job failed: ${error}`);
    throw error;
  }
}, {
  connection: redisConnection,
});

worker.on('completed', async (job) => {
  logger.info(`Job ${job.id} completed`);
  const { id } = job.data;
  await supabase.from('messages').update({ status: 'sent' }).eq('id', id);
});

worker.on('failed', async (job, err) => {
  logger.error(`Job ${job?.id} failed: ${err.message}`);
  if (!job) return;
  const { id } = job.data;
  await supabase.from('messages').update({ status: 'failed' }).eq('id', id);
});

export default worker;
