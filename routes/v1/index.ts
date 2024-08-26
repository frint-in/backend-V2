import express from 'express';
import userRouter from './User';
import authRouter from './authentication';

const v1Router = express.Router();

v1Router.use('/user', userRouter);
v1Router.use('/auth', authRouter);

export default v1Router;