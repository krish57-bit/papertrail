import { Router } from 'express';
import * as ctrl from '../controllers/paperController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/search', ctrl.search);
router.get('/stats', ctrl.stats);
router.get('/recommend', ctrl.recommend);
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.get);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

export default router;
