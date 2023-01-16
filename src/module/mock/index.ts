import slash from 'slash';
import Mock from 'mockjs';
import { isArray, niceTry, niceTryAsync } from './../../utils/index';
import fs from 'fs-extra';
import path from 'path';
import { ROOT_PATH, SCHEMA_TYPE } from '../../constants';
import { MAX_COUNT, MIN_COUNT, RANDOM_RANGE } from '../../constants/mock';

const Random = Mock.Random;
const inputPath = slash(path.join(ROOT_PATH, 'output/single.json'));
const outputPath = slash(path.join(ROOT_PATH, 'mockOutput/data.json'));

export const genAnyOf = () => [Mock.mock('@ctitle'), Mock.mock('@natural'), null, Math.random() < 0.5];

// TODO: 复杂对象优化不要每次都生成没必要的东西
const getAnyOf = (items: any[] = genAnyOf()) => {
    const len = items.length;
    const randomIndex = Math.floor(Math.random() * len);
    return items[randomIndex];
};

const getIsNotRequired = () => Math.random() < RANDOM_RANGE;

const getCount = (min = MIN_COUNT, max = MAX_COUNT) => Math.abs(Math.floor(Math.random() * (max - min) + min));

export const genMockData = (schema: IAllSchema, ownKey = ''): any => {
    if (schema.isRequired === false && getIsNotRequired()) {
        return null;
    }
    switch (schema.key) {
        case SCHEMA_TYPE.string:
            return Random.ctitle();
        case SCHEMA_TYPE.number:
            return Random.natural();
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
    return;
};

export const getMockData = async (): Promise<IObject | null> => {
    let jsonSchema: IFormattedSchema[] | undefined = await niceTryAsync(async () => {
        const jsonSchema = await fs.readJson(inputPath);
        return jsonSchema;
    });
    let mockData: any[] = [];
    if (jsonSchema) {
        mockData = jsonSchema.map(({ path, schema }) => {
            const data = genMockData(schema);
            if (data === undefined) {
                return { path, data: 'ERROR' };
            }
            return { path, data };
        });
        // console.log('jsonSchema ===> ', jsonSchema);
    }
    const result = await niceTryAsync(async () => {
        await fs.writeJSON(outputPath, mockData, { spaces: '\t' });
        return 'success';
    });
    console.log('result ===> ', result || 'fail');
    return null;
};

getMockData();
