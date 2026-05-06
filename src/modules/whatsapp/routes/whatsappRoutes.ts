import { Router } from 'express';
import { handleWebhook } from '../webhook/webhookHandler';

const router = Router();

router.post('/webhook', handleWebhook);

export default router;