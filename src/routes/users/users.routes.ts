import { Router } from 'express';
import { UsersController } from '../../controllers/users/users.controller';


const router = Router();
const usersController = new UsersController();

router.get('/', (req, res) => {
    console.log('[GET] /usuarios');
    usersController.getAll(req, res);
});

export default router;
