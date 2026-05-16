import { MetaWebhookPayload, MetaWebhookRoutingKeys } from '../../../types/metaWebhook';

export const normalizePhoneNumber = (value: string): string => value.replace(/\D/g, '');

export const isMetaWhatsAppWebhook = (payload: unknown): payload is MetaWebhookPayload => {
  if (!payload || typeof payload !== 'object') return false;
  const body = payload as MetaWebhookPayload;
  return body.object === 'whatsapp_business_account' && Array.isArray(body.entry);
};

export const extractRoutingKeys = (payload: MetaWebhookPayload): MetaWebhookRoutingKeys => {
  const phoneNumberIds = new Set<string>();
  const displayPhoneNumbers = new Set<string>();

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const metadata = change.value?.metadata;
      if (metadata?.phone_number_id) {
        phoneNumberIds.add(metadata.phone_number_id);
      }
      if (metadata?.display_phone_number) {
        displayPhoneNumbers.add(normalizePhoneNumber(metadata.display_phone_number));
      }
    }
  }

  return {
    phoneNumberIds: [...phoneNumberIds],
    displayPhoneNumbers: [...displayPhoneNumbers],
  };
};
