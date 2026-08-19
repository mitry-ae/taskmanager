import { AuthPayload } from "./common/types"

declare module 'express' {
    interface Request {
        user?: AuthPayload
    }
}

export {}