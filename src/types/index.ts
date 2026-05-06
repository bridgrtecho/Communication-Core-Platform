export interface Project {
  id: string;
  project_id: string;
  api_key: string;
  waba_number: string;
  callback_url: string;
  created_at: string;
}

export interface Message {
  id: string;
  project_id: string;
  channel: string;
  to_number: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  created_at: string;
}

export interface QueueJob {
  id: string;
  projectId: string;
  channel: string;
  to: string;
  message: string;
}