import crypto from 'crypto';
import { supabase } from '../../../core/config/supabase';
import { logger } from '../../../core/logger';
import { Project } from '../../../types';

export interface CreateProjectPayload {
  projectName: string;
  callbackUrl: string;
  wabaNumber: string;
  phoneNumberId: string;
  accessToken: string;
}

export interface UpdateProjectPayload {
  projectName?: string;
  callbackUrl?: string;
  wabaNumber?: string;
  phoneNumberId?: string;
  accessToken?: string;
}

const generateApiKey = () => crypto.randomBytes(32).toString('hex');

const ensureUniqueApiKey = async (): Promise<string> => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const apiKey = generateApiKey();
    const { data, error } = await supabase.from('projects').select('id').eq('api_key', apiKey).maybeSingle();
    if (error) {
      logger.error(`API key uniqueness check error: ${error.message}`);
      throw error;
    }

    if (!data) {
      return apiKey;
    }
  }

  throw new Error('Unable to generate a unique API key');
};

export const createProjectRecord = async (payload: CreateProjectPayload) => {
  const { projectName, callbackUrl, wabaNumber, phoneNumberId, accessToken } = payload;
  const projectId = crypto.randomUUID();
  const apiKey = await ensureUniqueApiKey();

  const { data, error } = await supabase.from('projects').insert({
    project_id: projectId,
    project_name: projectName,
    api_key: apiKey,
    waba_number: wabaNumber,
    phone_number_id: phoneNumberId,
    access_token: accessToken,
    callback_url: callbackUrl,
  }).select().single();

  if (error || !data) {
    logger.error(`Project insert error: ${error?.message}`);
    throw error || new Error('Failed to insert project');
  }

  return {
    projectId: data.project_id,
    apiKey: data.api_key,
  };
};

export const fetchProjectById = async (projectId: string): Promise<Omit<Project, 'access_token'> | null> => {
  const { data, error } = await supabase.from('projects')
    .select('id, project_id, project_name, waba_number, phone_number_id, callback_url, created_at')
    .eq('project_id', projectId)
    .single();

  if (error) {
    logger.error(`Fetch project error: ${error.message}`);
    throw error;
  }

  return data as Omit<Project, 'access_token'> | null;
};

export const updateProjectRecord = async (projectId: string, updates: UpdateProjectPayload) => {
  const payload: Record<string, unknown> = {};

  if (updates.projectName) payload.project_name = updates.projectName;
  if (updates.callbackUrl) payload.callback_url = updates.callbackUrl;
  if (updates.wabaNumber) payload.waba_number = updates.wabaNumber;
  if (updates.phoneNumberId) payload.phone_number_id = updates.phoneNumberId;
  if (updates.accessToken) payload.access_token = updates.accessToken;

  const { data, error } = await supabase.from('projects')
    .update(payload)
    .eq('project_id', projectId)
    .select('id, project_id, project_name, waba_number, phone_number_id, callback_url, created_at')
    .single();

  if (error || !data) {
    logger.error(`Update project error: ${error?.message}`);
    throw error || new Error('Failed to update project');
  }

  return data as Omit<Project, 'access_token'>;
};
