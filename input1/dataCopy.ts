import { Person } from './index';

export interface IItem {
    num: number;
    key: string;
}

export interface DATA1 {
    // prettier-ignore
    '/api/test6'?: number | string | void | null | undefined;
    name?: number;
    '/api/test4': string;
    '/api/test5': number;
    '/api/test8': number;
}

export default interface DATA111 {
    '/api/test1': Person;
    '/api/test2': number;
    '/api/test3'?: boolean;
    '/api/test33': boolean;
    '/api/test4': 'video' | 'audio';
    '/api/test5': string[];
    '/api/test6': {
        isTop: boolean;
        isOnline?: boolean;
    };
    '/api/test7': {
        key: number;
        name: string;
    }[];
}
