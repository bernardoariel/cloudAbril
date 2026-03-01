// DTO para el webhook de WhatsApp - estructura simplificada
export class WebhookEntryDto {
  id: string;
  changes: WebhookChangeDto[];
}

export class WebhookChangeDto {
  value: WebhookValueDto;
  field: string;
}

export class WebhookValueDto {
  messaging_product?: string;
  metadata?: {
    display_phone_number: string;
    phone_number_id: string;
  };
  contacts?: Array<{
    profile: { name: string };
    wa_id: string;
  }>;
  messages?: Array<{
    from: string;
    id: string;
    timestamp: string;
    type: string;
    text?: { body: string };
    image?: { id: string; mime_type: string; sha256: string; caption?: string };
    audio?: { id: string; mime_type: string; sha256: string };
    video?: { id: string; mime_type: string; sha256: string };
    document?: { id: string; mime_type: string; sha256: string; filename?: string };
    location?: { latitude: number; longitude: number; name?: string; address?: string };
    contacts?: any[];
  }>;
  statuses?: Array<{
    id: string;
    recipient_id: string;
    status: string;
    timestamp: string;
    conversation?: any;
    pricing?: any;
    errors?: Array<{
      code: number;
      title: string;
      message?: string;
      error_data?: any;
    }>;
  }>;
  errors?: Array<{
    code: number;
    title: string;
    message?: string;
  }>;
}

export class WhatsAppWebhookDto {
  object: string;
  entry: WebhookEntryDto[];
}
