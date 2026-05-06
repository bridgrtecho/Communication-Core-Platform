import { Queue } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL!;

export const messageQueue = new Queue('messages', {
  connection: redisUrl,
});