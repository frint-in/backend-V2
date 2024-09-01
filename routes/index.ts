import express from 'express';
import userRouter from './v1/User';
import organisationRouter from './v1/Organisation';
import authenticationRouter from './v1/authentication';
import eventRouter from './v1/Event';
import subeventRouter from './v1/Subevent';

const v1Router = express.Router();

v1Router.use('/user', userRouter);
v1Router.use('/organisation', organisationRouter);
v1Router.use('/auth', authenticationRouter);
v1Router.use('/event', eventRouter);
v1Router.use('/subevent', subeventRouter);


export default v1Router;