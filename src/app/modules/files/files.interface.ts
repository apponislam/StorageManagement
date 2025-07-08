export interface IFile {
    _id?: string;
    name: string;
    path: string;
    size: number;
    type: string;
    owner: string;
    parentFolder: string;
    createdAt?: Date;
    updatedAt?: Date;
    isDeleted?: boolean;
}
