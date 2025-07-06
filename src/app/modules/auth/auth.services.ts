import { User } from "./auth.model";

const createUser = async (userData: IUser) => {
    const result = await User.create(userData);
    return result;
};

export const UserService = {
    createUser,
};
