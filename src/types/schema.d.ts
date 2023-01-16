declare global {
    type ISchemaConstType = string | number | null | boolean;
    type ISchemaBaseType = 'string' | 'number' | 'null' | 'boolean';
    type ITSJSONSchema7TypeName = 'string' | 'number' | 'null' | 'boolean' | 'array' | 'object';

    type ISchemaAllType = ISchemaBaseType | 'ERROR' | 'enum' | 'array' | 'anyOf' | 'any' | 'object';

    interface IBaseSchema {
        isRequired?: boolean;
    }

    interface IStringSchema extends IBaseSchema {
        key: 1;
        extraType: 'string';
    }

    interface INumberSchema extends IBaseSchema {
        key: 2;
        extraType: 'number';
    }

    interface INullSchema extends IBaseSchema {
        key: 3;
        extraType: 'null';
    }

    interface IBooleanSchema extends IBaseSchema {
        key: 4;
        extraType: 'boolean';
    }

    type ISimpleSchema = IStringSchema | INumberSchema | INullSchema | IBooleanSchema;

    // error排查错误
    interface IERRORSchema extends IBaseSchema {
        key: 5;
        extraType: 'ERROR';
        msg: string;
        where: string;
    }

    // const和enum共用
    interface IEnumSchema extends IBaseSchema {
        key: 6;
        extraType: 'enum';
        enum: ISchemaConstType[];
    }

    interface IArraySchema extends IBaseSchema {
        key: 7;
        extraType: 'array';
        items: IAllSchema | IAllSchema[];
        min?: number;
        max?: number;
    }

    interface IAnyOfSchema extends IBaseSchema {
        key: 8;
        extraType: 'anyOf';
        anyOf: IAllSchema[];
    }

    interface IAnySchema extends IBaseSchema {
        key: 9;
        extraType: 'any';
    }

    interface IObjectSchema extends IBaseSchema {
        key: 10;
        extraType: 'object';
        properties: Record<string, IAllSchema> | IAnySchema;
        additionalProperties?: IAllSchema;
        required: string[] | null | undefined;
    }

    // prettier-ignore
    type IAllSchema =
        ISimpleSchema |
        IERRORSchema |
        IEnumSchema |
        IArraySchema |
        IAnyOfSchema |
        IAnySchema |
        IObjectSchema;

    interface IFormattedSchema {
        path: string;
        schema: IAllSchema;
    }
}

export {};
