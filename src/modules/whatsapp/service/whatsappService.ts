import axios from 'axios';
import { logger } from '../../../core/logger';
import { ProjectWhatsAppCredentials } from '../../project/service/projectService';

export const sendWhatsAppMessage = async (
  to: string,
  message: string,
  credentials: ProjectWhatsAppCredentials,
) => {
  const { project_id: projectId, phone_number_id: phoneNumberId, access_token: accessToken } = credentials;

  logger.info(`Sending WhatsApp message for project ${projectId} to ${to}`);

  try {
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    const body = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: {
        body: message,
      },
    };

    const response = await axios.post(url, body, { headers });

    logger.info(`WhatsApp API response for project ${projectId}: ${JSON.stringify(response.data)}`);
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    logger.error(`WhatsApp API error for project ${projectId}: ${JSON.stringify(err.response?.data) || err.message}`);
    throw error;
  }
};

export const callAIService = async (inputMessage: string) => {
  logger.info(`Calling AI service with: ${inputMessage}`);
  return 'AI response placeholder';
};
