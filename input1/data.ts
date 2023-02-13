export default interface DATA {
    '/api/test': Person;
}
type ValueOf<T> = T[keyof T]; // ValufOf<typeof TEST_TYPE>// ValufOf<typeof TOP_STATUS>
// ValufOf<typeof TOP_ENUM>
/**
 * @description 上架状态
 * @enum0: 已上架
 * @template
 * 1: 未上架
 */
export enum TOP_ENUM {
    isTop = 0,
    isNotTop = 1
}

// ValufOf<typeof ONLINE_STATUS>
export enum ONLINE_STATUS {
    isONLINE = 0,
    isNotONLINE = 1
}

export interface Person {
    type0: null;
    type1: undefined;
    type2: void;

    type3: string;
    type4: number;
    type5?: boolean;

    type6: string[];
    type7: {
        name: string;
        age: number;
    };
    type8: {
        isHot?: boolean;
        where: string;
        code: 0 | 1;
    }[];

    type9: string | number;

    type10: 'Male' | 'Female';
    type11: 0 | 1 | 2;
    type12: number | `${number}`;
    type13: 0 | 1 | '0' | '1';
    type14: '';

    type15: [string, string];
    type16: [string, number, string, boolean];
    type17: true | string | number[] | { type: string; num: number }[];
    type18: ValueOf<typeof ONLINE_STATUS>;
    type19: (boolean | { type: string; num: number })[];
    type20: (boolean | any)[];
    type21: 0 | 1 | '0' | '1' | null | true | false | any | (0 | '1')[];
    // additionalProperties 和 properties都为空的时候是any
    type22: {
        [key: string]: any;
    };
    type23: {
        [key: string]: number;
    };
    type24: {
        num: number;
        age: number;
    } & { name: string };
    // type25: { num: number } & Record<
    //     string,
    //     {
    //         allCached: boolean;
    //         cacheList: any[];
    //     }
    // >;
    // type26: { [key: string]: string } & Record<
    //     string,
    //     {
    //         allCached: boolean;
    //         cacheList: any[];
    //     }
    // >;
    type27: Record<
        string,
        {
            allCached: boolean;
            cacheList: any[];
        }
    >;
    type28: {
        [key: string]: {
            allCached: boolean;
            cacheList: any[];
        };
    };
    // type30: { num: number } & {
    //     [key: string]: string[];
    // };
}
