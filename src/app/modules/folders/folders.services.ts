import { Types } from "mongoose";
import { Folder } from "./folders.model";
import bcrypt from "bcrypt";
import config from "../../config";

const encryptPin = async (pin: number): Promise<string> => {
    return await bcrypt.hash(pin.toString(), Number(config.bcrypt_salt_rounds));
};

const comparePin = async (enteredPin: string, storedPin: string): Promise<boolean> => {
    return await bcrypt.compare(enteredPin, storedPin);
};

const handleSecretFolder = async (payload: { pin: string; confirmPin?: string; owner: Types.ObjectId }) => {
    const { pin, confirmPin, owner } = payload;

    const existingFolder = await Folder.findOne({
        owner,
        folderType: "secret",
        isDeleted: false,
    })
        .select("+pin")
        .populate("files")
        .populate("subfolders")
        .lean();

    if (existingFolder?.pin) {
        const isMatch = await comparePin(pin, existingFolder.pin);
        if (!isMatch) throw new Error("Invalid PIN");

        const { pin: _, ...folderData } = existingFolder;
        return { action: "accessed", folder: folderData };
    }

    if (!confirmPin) {
        throw new Error("PIN confirmation required to create secret folder");
    }

    if (pin !== confirmPin) {
        throw new Error("PIN and confirmation PIN don't match");
    }

    const hashedPin = await encryptPin(Number(pin));
    const newFolder = await Folder.create({
        name: "Secret Folder",
        folderType: "secret",
        pin: hashedPin,
        owner,
    });

    return { action: "created", folder: newFolder.toObject() };
};

const createFolder = async (payload: { name: string; folderType: "normal"; owner: Types.ObjectId; parentFolder?: string }) => {
    const { name, folderType, owner, parentFolder } = payload;

    const folderData = {
        name,
        folderType,
        owner,
        parentFolder: parentFolder ? new Types.ObjectId(parentFolder) : null,
    };

    return await Folder.create(folderData);
};

const getFolder = async (folderId: string, userId: Types.ObjectId) => {
    const folder = await Folder.findOne({
        _id: new Types.ObjectId(folderId),
        owner: userId,
        isDeleted: false,
    })
        .populate("files")
        .populate("subfolders")
        .lean();
    if (!folder) throw new Error("Folder not found");
    return folder;
};

const updateFolder = async (params: {
    folderId: string;
    userId: Types.ObjectId;
    updateData: {
        name?: string;
        parentFolder?: string | null;
    };
}) => {
    const { folderId, userId, updateData } = params;

    const updatePayload: any = {};
    if (updateData.name) updatePayload.name = updateData.name;
    if (updateData.parentFolder !== undefined) {
        updatePayload.parentFolder = updateData.parentFolder ? new Types.ObjectId(updateData.parentFolder) : null;
    }

    const folder = await Folder.findOneAndUpdate({ _id: new Types.ObjectId(folderId), owner: userId }, updatePayload, { new: true })
        // .populate("files")
        .populate("subfolders")
        .lean();

    if (!folder) throw new Error("Folder not found");
    return folder;
};

const deleteFolder = async (folderId: string, userId: Types.ObjectId) => {
    const folder = await Folder.findOneAndUpdate({ _id: new Types.ObjectId(folderId), owner: userId }, { isDeleted: true }, { new: true });
    if (!folder) throw new Error("Folder not found");
    return folder;
};

export const FolderServices = { handleSecretFolder, createFolder, getFolder, updateFolder, deleteFolder };
