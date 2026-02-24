import express from 'express';
import controller from '../controllers/DocumentController.js';

const router = express.Router();

router.post('/', controller.create);
router.get('/:id', controller.get);

export default router;