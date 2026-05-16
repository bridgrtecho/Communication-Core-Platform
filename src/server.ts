import express from 'express';
import dotenv from 'dotenv';
import { authMiddleware } from './core/middleware/auth';
import { sendNotification } from './modules/notification/controller/notificationController';
import whatsappRoutes from './modules/whatsapp/routes/whatsappRoutes';
import projectRoutes from './modules/project/routes/projectRoutes';
import { logger } from './core/logger';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const whatsappWebhookPaths = ['/webhook/whatsapp', '/api/whatsapp/webhook'];

app.use(express.json({
  verify: (req, _res, buf) => {
    const path = req.url?.split('?')[0] ?? '';
    if (whatsappWebhookPaths.some((webhookPath) => path.startsWith(webhookPath))) {
      (req as express.Request).rawBody = buf;
    }
  },
}));

app.post('/send-notification', authMiddleware, sendNotification);
for (const webhookPath of whatsappWebhookPaths) {
  app.use(webhookPath, whatsappRoutes);
}
app.use('/api/v1/projects', projectRoutes);

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
