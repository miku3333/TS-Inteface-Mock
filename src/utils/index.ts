interface INiceTry {
    <T>(fn: () => T): T | void;
}

interface INiceTryAsync {
    <T>(fn: () => Promise<T>): Promise<T | void>;
}

export const niceTry: INiceTry = (func) => {
    try {
        return func();
    } catch (e) {
        console.log(e);
    }
};

export const niceTryAsync: INiceTryAsync = async (func) => {
    try {
        return await func();
    } catch (e) {
        console.log(e);
    }
};

export const isArray = (item: any) => Array.isArray(item);
