import { Queue } from 'bullmq';
import { redisConnection } from '../core/config/redis';

export const messageQueue = new Queue('messages', {
  connection: redisConnection,
});