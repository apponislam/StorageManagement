import { IFile } from "./files.interface";
import { File } from "./files.model";

const createFile = async (payload: Partial<IFile>): Promise<IFile> => {
    return File.create(payload);
};

export const FileServices = {
    createFile,
};
