export const prettifyName = (raw?: string): string => {
    if (!raw) return "user";

    return raw.replace(/\s+/g, "").replace(/[^a-zA-Z0-9]/g, "");
};
