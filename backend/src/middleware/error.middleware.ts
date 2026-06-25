import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    if (res.headersSent) {
        return next(err);
    }
    if(err.status && err.message){
        res.status(err.status).send({ message: err.message });
    }else{
        res.status(500).send({ message: 'Something broke!' });
    }
    next();
}