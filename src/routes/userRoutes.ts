import express from 'express';
import { UserController } from '../controllers/userContoller.js';

const router = express.Router();

// User routes
router.post('/register', UserController.createUser);
router.get('/', UserController.getUsers);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

export default router; 