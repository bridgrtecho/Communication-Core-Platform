export interface MetaWebhookPayload {
  object: string;
  entry?: MetaWebhookEntry[];
}

export interface MetaWebhookEntry {
  id: string;
  changes?: MetaWebhookChange[];
}

export interface MetaWebhookChange {
  field: string;
  value: {
    messaging_product?: string;
    metadata?: {
      display_phone_number?: string;
      phone_number_id?: string;
    };
    [key: string]: unknown;
  };
}

export interface MetaWebhookRoutingKeys {
  phoneNumberIds: string[];
  displayPhoneNumbers: string[];
}
