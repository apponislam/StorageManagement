import { Types } from "mongoose";

export interface IFolder {
    _id?: string;
    name: string;
    owner: Types.ObjectId;
    parentFolder?: string;
    folderType: "normal" | "secret";
    pin?: string;
    files: string[];
    subfolders: string[];
    createdAt?: Date;
    updatedAt?: Date;
    isDeleted?: boolean;
}
