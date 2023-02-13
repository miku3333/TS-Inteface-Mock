import fs from 'fs-extra';
import Mock from 'mockjs';
import { ROOT_PATH, SCHEMA_TYPE, SERVER_PATH } from '../../constants';
import { MAX_COUNT, MIN_COUNT, RANDOM_RANGE } from '../../constants/mock';
import dayjs from 'dayjs';
import glob from 'fast-glob';
import slash from 'slash';
import path from 'path';

const imgs: string[] = fs.readFileSync(path.join(ROOT_PATH, 'imgs.txt')).toString().split('\n');
const getRandomImg = () => {
    const len = imgs.length;
    const index = Math.floor(Math.random() * len + 1);
    return `${SERVER_PATH}/img/${imgs[index]}`;
};

const Random = Mock.Random;

export const genAnyOf = () => [Mock.mock('@ctitle'), Mock.mock('@natural'), null, Math.random() < 0.5];

// TODO: 复杂对象优化不要每次都生成没必要的东西
const getAnyOf = (items: any[] = genAnyOf()) => {
    const len = items.length;
    const randomIndex = Math.floor(Math.random() * len);
    return items[randomIndex];
};

const getIsNotRequired = () => Math.random() < RANDOM_RANGE;

const getCount = (min = MIN_COUNT, max = MAX_COUNT, isInt = true) => {
    const random = Math.random() * (max - min) + min;
    if (isInt) {
        return Math.abs(Math.floor(random));
    } else {
        return Math.abs(random);
    }
};

const getMinMax = (min?: number, max?: number) => {
    const hasMin = typeof min === 'number';
    const hasMax = typeof max === 'number';
    if (hasMin && hasMax) {
        return [min, max];
    } else if (hasMin) {
        return [min, min + 14];
    } else if (hasMax) {
        return [Math.max(max - 14, 0), max];
    } else {
        return [1, 15];
    }
};

export const genMockData = (schema: IAllSchemaExtended, ownKey = ''): any => {
    if (schema.isRequired === false && getIsNotRequired()) {
        return null;
    }
    switch (schema.key) {
        case SCHEMA_TYPE.string: {
            const { type } = schema;
            const [min, max] = getMinMax(schema.min, schema.max);
            switch (type) {
                case 'timestamp':
                    return dayjs(Random.datetime()).valueOf();
                case 'url':
                    return Random.url();
                case 'imgUrl':
                    return getRandomImg();
                case 'county':
                    return Random.county(true);
                case 'name':
                    return Random.cname();
                case 'en':
                    return Random.word(min, max);
                case 'normal':
                default:
                    return Random.ctitle(min, max);
            }
        }
        case SCHEMA_TYPE.number: {
            const { type } = schema;
            const [min, max] = getMinMax(schema.min, schema.max);
            switch (type) {
                case 'int':
                    return getCount(min, max);
                case 'float':
                    return getCount(min, max, false);
                case 'timestamp':
                    return dayjs(Random.datetime()).valueOf();
            }
            return Random.natural();
        }
        case SCHEMA_TYPE.null:
            return null;
        case SCHEMA_TYPE.boolean:
            return getAnyOf([false, true]);
        case SCHEMA_TYPE.any:
            if (ownKey.includes('type22')) {
                console.log(ownKey, ' ===> ', schema);
            }
            // 22
            // TODO: 优化any
            // prettier-ignore
            return getAnyOf();
        case SCHEMA_TYPE.anyOf:
            return getAnyOf(schema.anyOf.map((item) => genMockData(item)));
        case SCHEMA_TYPE.enum:
            return getAnyOf(schema.enum);
        case SCHEMA_TYPE.array:
            if (Array.isArray(schema.items)) {
                return schema.items.map((item) => genMockData(item));
            }
            const count = getCount(schema.min, schema.max);
            // 不能是空元素不然map失败
            return new Array(count).fill('').map(() => genMockData(schema.items as IAllSchema));
        case SCHEMA_TYPE.object:
            const { required, properties, additionalProperties } = schema;
            const resultObject: IObject = {};
            if (properties?.key === SCHEMA_TYPE.any) {
                for (let i = 0; i < getCount(); i++) {
                    resultObject[Random.word()] = getAnyOf();
                }
            } else {
                Object.entries(properties as Record<string, IAllSchema>).forEach(([key, schema]) => {
                    if (required && !required.includes(key) && getIsNotRequired()) {
                        resultObject[key] = null;
                        return;
                    }
                    resultObject[key] = genMockData(schema, ownKey + '/' + key);
                    // if (key === 'type22') {
                    //     console.log('key ===> ', key);
                    //     console.log('resultObject[key] ===> ', resultObject[key]);
                    // }
                });
            }
            if (additionalProperties) {
                for (let i = 0; i < getCount(); i++) {
                    const key = Random.word();
                    resultObject[key] = genMockData(additionalProperties, ownKey + '/' + key);
                }
            }
            return resultObject;
        case SCHEMA_TYPE.ERROR:
            return schema;
    }
    return 'ERROR';
};
