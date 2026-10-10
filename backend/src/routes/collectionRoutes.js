import { Router } from 'express';
import * as ctrl from '../controllers/collectionController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/public', ctrl.listPublic);
router.get('/public/:slug', ctrl.getPublicBySlug);

router.use(requireAuth);

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.get);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

export default router;
