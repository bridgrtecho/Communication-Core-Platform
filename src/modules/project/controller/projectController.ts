import { Request, Response } from 'express';
import { logger } from '../../../core/logger';
import {
  CreateProjectPayload,
  createProjectRecord,
  fetchProjectById,
  updateProjectRecord,
} from '../service/projectService';

export const createProject = async (req: Request, res: Response) => {
  const { projectName, callbackUrl, wabaNumber, phoneNumberId, accessToken } = req.body as CreateProjectPayload;

  if (!projectName || !callbackUrl || !wabaNumber || !phoneNumberId || !accessToken) {
    return res.status(400).json({ error: 'projectName, callbackUrl, wabaNumber, phoneNumberId, and accessToken are required' });
  }

  try {
    const result = await createProjectRecord({ projectName, callbackUrl, wabaNumber, phoneNumberId, accessToken });
    return res.status(201).json(result);
  } catch (error: any) {
    logger.error(`Create project failed: ${error.message || error}`);
    return res.status(500).json({ error: 'Unable to onboard project' });
  }
};

export const getProject = async (req: Request, res: Response) => {
  const projectId = req.params.id;

  if (req.project?.project_id !== projectId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const project = await fetchProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.json(project);
  } catch (error: any) {
    logger.error(`Get project failed: ${error.message || error}`);
    return res.status(500).json({ error: 'Unable to fetch project' });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  const projectId = req.params.id;
  const { projectName, callbackUrl, wabaNumber, phoneNumberId, accessToken } = req.body as Partial<CreateProjectPayload>;

  if (req.project?.project_id !== projectId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (!projectName && !callbackUrl && !wabaNumber && !phoneNumberId && !accessToken) {
    return res.status(400).json({ error: 'At least one field must be provided for update' });
  }

  try {
    const project = await updateProjectRecord(projectId, { projectName, callbackUrl, wabaNumber, phoneNumberId, accessToken });
    return res.json(project);
  } catch (error: any) {
    logger.error(`Update project failed: ${error.message || error}`);
    return res.status(500).json({ error: 'Unable to update project' });
  }
};
