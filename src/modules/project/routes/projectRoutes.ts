import { Router } from 'express';
import { authMiddleware } from '../../../core/middleware/auth';
import { createProject, getProject, updateProject } from '../controller/projectController';

const router = Router();

router.post('/', createProject);
router.get('/:id', authMiddleware, getProject);
router.put('/:id', authMiddleware, updateProject);

export default router;
