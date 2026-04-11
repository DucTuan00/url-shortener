import { Router } from 'express';
import { AuthController } from '@/modules/auth/auth.controller';
import { AuthService } from '@/modules/auth/auth.service';
import { UserRepository } from '@/modules/auth/user.repository';
import { validate } from '@/core/middleware/validate';
import { registerSchema, loginSchema } from '@/modules/auth/auth.validation';
import { authenticate } from '@/core/middleware/auth';

const router = Router();

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

export default router;
