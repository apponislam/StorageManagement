import { Types } from "mongoose";

export interface IFile {
    _id?: string;
    name: string;
    path: string;
    size: number;
    type: string;
    owner: Types.ObjectId;
    parentFolder?: Types.ObjectId;
    secretFolder?: boolean;
    favorite?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    isDeleted?: boolean;
}
