import { type Request, type Response, type NextFunction } from "express";
import { AppError } from "../common/errors";

export function errorMiddleware(err: unknown, req: Request, res: Response, next: NextFunction) {


    if (isBodyParseError(err) && err.type === 'entity.parse.failed') {
        return res.status(400).json({status: "error", message: "JSON invalid"})
    } 
    
    if(err instanceof AppError) {
        return res.status(err.statusCode).json({status: "error", message: err.message})
    } else {
        console.error(err)
        return res.status(500).json({status: "error", message: "Internal Server Error"})
    }


}

function isBodyParseError(err: unknown): err is {type: string} {
    return err !== null && typeof err === 'object' && 'type' in err

}