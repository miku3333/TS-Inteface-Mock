import { JSONSchema7, JSONSchema7Definition, JSONSchema7TypeName } from 'json-schema';
import _ from 'lodash';
import { SchemaGenerator } from 'ts-json-schema-generator';
import { ROOT_PATH, SCHEMA_TYPE } from '../../constants';
import fs from 'fs-extra';
import slash from 'slash';
import path from 'path';
// import {
//     IAllSchema,
//     IAnyOfSchema,
//     IAnySchema,
//     IArraySchema,
//     IBaseSchema,
//     IBooleanSchema,
//     IERRORSchema,
//     IEnumSchema,
//     INullSchema,
//     INumberSchema,
//     IObjectSchema,
//     ISchemaBaseType,
//     ISchemaConstType,
//     ISimpleSchema,
//     IStringSchema,
//     SCHEMA_TYPE
// } from './interface';

interface IEffectiveSchema {
    path: string;
    schema: JSONSchema7;
}

const isEffectivePath = (path: string) => new RegExp(/^(\/[\w-]+)+\/?$/).test(path);
const isJSONSchema7 = (schema?: JSONSchema7Definition) => schema && typeof schema !== 'boolean';

const getEffectiveSchema = (schema: JSONSchema7) => {
    const result: IEffectiveSchema[] = [];
    const getEffectiveSchemaImpl = (schema: JSONSchema7Definition) => {
        if (typeof schema !== 'boolean') {
            [...Object.entries(schema.definitions || {}), ...Object.entries(schema.properties || {})].forEach(([path, schema]) => {
                if (typeof schema === 'boolean') {
                    return;
                }
                if (isEffectivePath(path)) {
                    result.push({
                        path,
                        schema
                    });
                    return;
                }
                getEffectiveSchemaImpl(schema);
            });
        }
    };
    getEffectiveSchemaImpl(schema);
    return result;
};

interface IFormatSchemaConfig {
    requiredInObject?: boolean;
}

const getSimpleSchema = (typeName: JSONSchema7TypeName): ISimpleSchema | IERRORSchema => {
    if (typeName === 'string') {
        const tempSchema: IStringSchema = {
            key: SCHEMA_TYPE.string,
            extraType: 'string'
        };
        return tempSchema;
    } else if (typeName === 'number') {
        const tempSchema: INumberSchema = {
            key: SCHEMA_TYPE.number,
            extraType: 'number'
        };
        return tempSchema;
    } else if (typeName === 'null') {
        const tempSchema: INullSchema = {
            key: SCHEMA_TYPE.null,
            extraType: 'null'
        };
        return tempSchema;
    } else if (typeName === 'boolean') {
        const tempSchema: IBooleanSchema = {
            key: SCHEMA_TYPE.boolean,
            extraType: 'boolean'
        };
        return tempSchema;
    } else {
        const tempSchema: IERRORSchema = {
            key: SCHEMA_TYPE.ERROR,
            extraType: 'ERROR',
            msg: '??????simpleSchema??????',
            where: 'getSimpleSchema'
        };
        return tempSchema;
    }
};

const formatSchema = (schemas: IEffectiveSchema[], config?: IFormatSchemaConfig) => {
    const { requiredInObject = true } = config || {};
    const formatSchemaImpl = (schema?: JSONSchema7Definition, isRequired = true): IAllSchema => {
        const baseSchmea: IBaseSchema = {
            isRequired
        };
        if (requiredInObject) {
            delete baseSchmea.isRequired;
        }
        let formattedSchmea: IAllSchema;
        if (!schema || typeof schema === 'boolean') {
            const tempSchema: IERRORSchema = {
                ...baseSchmea,
                key: SCHEMA_TYPE.ERROR,
                extraType: 'ERROR',
                where: "!schema || typeof schema === 'boolean'",
                msg: 'JSONSchema7????????????JSONSchema7Definition???schema??????'
            };
            // ????????????????????????
            formattedSchmea = tempSchema;
        } else if (schema.not) {
            const tempSchema: INullSchema = {
                ...baseSchmea,
                key: SCHEMA_TYPE.null,
                extraType: 'null'
            };
            formattedSchmea = tempSchema;
        } else if (Object.keys(schema).length === 1 && schema.type && schema.type !== 'object') {
            // ??????????????????any???object
            if (Array.isArray(schema.type)) {
                const childSchme = schema.type.map(getSimpleSchema);
                const tempSchema: IAnyOfSchema = {
                    ...baseSchmea,
                    key: SCHEMA_TYPE.anyOf,
                    extraType: 'anyOf',
                    anyOf: childSchme
                };
                formattedSchmea = tempSchema;
            } else {
                formattedSchmea = getSimpleSchema(schema.type);
            }
        } else if (schema.const !== undefined && schema.const !== null) {
            // ???????????????ISchemaConstType????????????, ????????????bug
            const tempSchema: IEnumSchema = {
                ...baseSchmea,
                key: SCHEMA_TYPE.enum,
                extraType: 'enum',
                enum: [schema.const as ISchemaConstType]
            };
            formattedSchmea = tempSchema;
        } else if (schema.enum) {
            const tempSchema: IEnumSchema = {
                ...baseSchmea,
                key: SCHEMA_TYPE.enum,
                extraType: 'enum',
                enum: schema.enum as ISchemaConstType[]
            };
            formattedSchmea = tempSchema;
        } else if (schema.type === 'array') {
            // ??????min???max???????????????
            const min = schema.minItems;
            const max = schema.maxItems;
            // prettier-ignore
            const items = Array.isArray(schema.items)
                ? schema.items.map((item) => formatSchemaImpl(item))
                : formatSchemaImpl(schema.items);
            const tempSchema: IArraySchema = {
                ...baseSchmea,
                key: SCHEMA_TYPE.array,
                extraType: 'array',
                items,
                min,
                max
            };
            formattedSchmea = tempSchema;
        } else if (schema.anyOf) {
            // ??????min???max???????????????
            const anyOf = schema.anyOf.map((item) => formatSchemaImpl(item));
            const tempSchema: IAnyOfSchema = {
                ...baseSchmea,
                key: SCHEMA_TYPE.anyOf,
                extraType: 'anyOf',
                anyOf
            };
            formattedSchmea = tempSchema;
        } else if (Object.keys(schema).length === 0) {
            // ???????????????any
            const tempSchema: IAnySchema = {
                ...baseSchmea,
                key: SCHEMA_TYPE.any,
                extraType: 'any'
            };
            formattedSchmea = tempSchema;
        } else if (schema.type === 'object') {
            const required = schema.required || [];
            let properties: Record<string, IAllSchema> = _.mapValues(schema.properties, (property, key) => formatSchemaImpl(property, required.includes(key)));
            let additionalProperties: IAllSchema | IERRORSchema | undefined = void 0;
            if (isJSONSchema7(schema.additionalProperties)) {
                // ?????????bug
                const values = Object.values(schema.additionalProperties as JSONSchema7);
                let isInvalidSchema = false;
                if (values.length === 1) {
                    if (['object', 'array'].includes(values[0])) {
                        isInvalidSchema = true;
                    } else if (values[0]?.includes('object') || values[0]?.includes('array')) {
                        isInvalidSchema = true;
                    }
                }
                if (isInvalidSchema) {
                    const tempSchema: IERRORSchema = {
                        ...baseSchmea,
                        key: SCHEMA_TYPE.ERROR,
                        extraType: 'ERROR',
                        msg: '????????????????????????????????????&',
                        where: 'additionalProperties'
                    };
                    additionalProperties = tempSchema;
                } else {
                    additionalProperties = formatSchemaImpl(schema.additionalProperties, true);
                }
            }
            if (!Object.keys(properties).length && !additionalProperties) {
                // ???????????????baseSchema?????????????????????????????????
                const tempSchema: IAnySchema = {
                    ...baseSchmea,
                    key: 9,
                    extraType: 'any'
                };
                additionalProperties = tempSchema;
            }
            const tempSchema: IObjectSchema = {
                ...baseSchmea,
                key: SCHEMA_TYPE.object,
                extraType: 'object',
                properties,
                additionalProperties,
                required: requiredInObject ? schema.required : null
            };
            // ???[key: string]: any?????????
            formattedSchmea = tempSchema;
        } else {
            const tempSchema: IERRORSchema = {
                ...baseSchmea,
                key: SCHEMA_TYPE.ERROR,
                extraType: 'ERROR',
                msg: '???????????????????????????',
                where: 'else'
            };
            formattedSchmea = tempSchema;
        }
        return formattedSchmea;
    };
    return schemas.map(({ path, schema }) => ({ path, schema: formatSchemaImpl(schema) }));
};

export interface IIHandleSchemaConfig {
    format?: boolean;
}

const handleSchema = (schema: JSONSchema7, config?: IIHandleSchemaConfig) => {
    const { format = true } = config || {};
    const effectiveSchemas = getEffectiveSchema(schema);
    fs.writeFile(slash(path.join(ROOT_PATH, 'test.json')), JSON.stringify(effectiveSchemas, null, 2));
    console.log('effectiveSchemas ===> ', effectiveSchemas);
    const formattedSchemas = formatSchema(effectiveSchemas);
    // console.log(format);
    // console.log(formattedSchema);
    // _.toPairs(result)
    //     .filter(([name, schema]) => )
    //     .map(([name, schema]) => [name]);
    // console.log(test);
    return {
        effectiveSchemas,
        formattedSchemas
    };
};

export default handleSchema;
