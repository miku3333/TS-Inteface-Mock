declare global {
    interface IObject {
        [key: string]: any;
    }
    type ValueOf<T> = T[keyof T];
    const getFileName: (importMetaUrl: string) => string;
    const getDirName: (importMetaUrl: string) => string;
}

export {};
