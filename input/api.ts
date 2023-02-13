// export interface IString {
//     string0: string;
//     string1: string;
//     string2: string;
//     string3: string;
//     string4: string;
//     string5: string;
//     string6: string;
// }

// export interface API {
//     '/api/string': IString;
// }
export interface IBilibili {
    '/jd1': {
        search: string;
        banners: string[];
        vajras: {
            img: string;
            name: string;
        }[];
        scrolls: {
            img: string;
            value: number;
        }[];
        goodsList: {
            img: string;
            title: string;
            value: number;
            lowDay?: number;
            jdLogistics?: boolean;
            remarkCount?: number;
            favorableRate?: number;
            selfSupport: boolean;
            seckill?: boolean;
            jdSuperMarket?: boolean;
            fullDiscount?: [number, number];
            numberDiscount?: [number, number];
        }[];
    };
}
