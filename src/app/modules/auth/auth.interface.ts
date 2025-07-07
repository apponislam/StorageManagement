interface IUser {
    username: string;
    email: string;
    password: string;
    photo?: string;
    isDeleted: boolean;
    storageLimit: number;
}
