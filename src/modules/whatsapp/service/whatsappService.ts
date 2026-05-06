import axios from 'axios';
import { logger } from '../../../core/logger';

const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;

export const sendWhatsAppMessage = async (to: string, message: string, projectConfig: any) => {
  logger.info(`Sending WhatsApp message to ${to}: ${message}`);

  try {
    const url = `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const headers = {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    };

    const body = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: {
        body: message,
      },
    };

    const response = await axios.post(url, body, { headers });

    logger.info(`WhatsApp API response: ${JSON.stringify(response.data)}`);

    // Optionally, update message status in DB here
    // For now, just log success

  } catch (error: any) {
    logger.error(`WhatsApp API error: ${error.response?.data || error.message}`);
    throw error; // Re-throw to let worker handle retry
  }
};

export const callAIService = async (inputMessage: string) => {
  logger.info(`Calling AI service with: ${inputMessage}`);
  // Placeholder for future Python FastAPI service
  return 'AI response placeholder';
};