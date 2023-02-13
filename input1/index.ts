export type { Person } from './data';
export * from './dataCopy';

export interface IItem {
    num: number;
    key: string;
}

export interface DATA2333 {
    // prettier-ignore
    '/api/test6'?: number | string | void | null | undefined;
    name?: number;
    '/api/test4': string | number[] | { type: string; num: number }[];
    '/api/test5': number;
    '/api/test3': Record<
        string,
        {
            allCached: boolean;
            cacheList: any[];
        }
    >;
}
