import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { logger } from '../logger';
import { Project } from '../../types';

declare global {
  namespace Express {
    interface Request {
      project?: Project;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers.authorization?.replace('Bearer ', '') || req.headers.authorization;
  if (!apiKey) {
    logger.error('API key missing');
    return res.status(401).json({ error: 'API key required' });
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('api_key', apiKey)
      .single();

    if (error || !data) {
      logger.error(`Invalid API key: ${apiKey}`);
      return res.status(401).json({ error: 'Invalid API key' });
    }

    req.project = data as Project;
    logger.info(`Authenticated project: ${data.project_id}`);
    next();
  } catch (err) {
    logger.error(`Auth error: ${err}`);
    res.status(500).json({ error: 'Internal server error' });
  }
};