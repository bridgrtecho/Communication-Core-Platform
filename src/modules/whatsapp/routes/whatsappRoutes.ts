import { Router } from 'express';
import { handleWebhook, verifyWebhook } from '../webhook/webhookHandler';

const router = Router();

router.get('/', verifyWebhook);
router.post('/', handleWebhook);

export default router;