import { JwtPayload } from "jsonwebtoken";

declare global {
    namespace Express {
        interface User extends IUser {}
        interface Request {
            user?: IUser;
        }
    }
}
