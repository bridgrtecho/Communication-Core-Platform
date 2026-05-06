import express from 'express';
import dotenv from 'dotenv';
import { authMiddleware } from './core/middleware/auth';
import { sendNotification } from './modules/notification/controller/notificationController';
import whatsappRoutes from './modules/whatsapp/routes/whatsappRoutes';
import { logger } from './core/logger';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.post('/send-notification', authMiddleware, sendNotification);
app.use('/webhook/whatsapp', whatsappRoutes);

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});