import mongoose from 'mongoose';
import type {
    OpenAPIObject,
    OperationObject,
    ResponseObject,
    MediaTypeObject,
    SchemaObject,
    ReferenceObject,
} from 'openapi3-ts/oas30';
import { Config, Environment } from './config';

export async function connectToDatabase() {
    const url = getDatabaseUrl();
    console.log('URL', url);
    return mongoose.connect(url);
}

function getDatabaseUrl() {
    const username = Config.DATABASE_USERNAME;
    const password = Config.DATABASE_PASSWORD;
    const host = Config.DATABASE_HOST;
    let database;
    if (isProd()) {
        database = `prod`;
    } else if (isDev()) {
        database = `dev-${username}`;
    } else if (isTest()) {
        return Config.DATABASE_HOST;
    }

    return `mongodb+srv://${username}:${password}@${host}/${database}?retryWrites=true&w=majority&appName=rp-dev-cluster`;
}

export function isProd() {
    return Config.ENV == Environment.enum.PRODUCTION;
}

export function isDev() {
    return Config.ENV == Environment.enum.DEVELOPMENT;
}

export function isTest() {
    return Config.ENV == Environment.enum.TESTING;
}

export function isGithubCI() {
    return Config.ENV == Environment.enum.GITHUB_CI;
}

// because we're using jsdoc, we can't use plain ts objects as examples in endpoint docs, so the easiest
// solution is to add them in post-processing here because it ensures they exist (endpoints that can
// return multiple schemas will only show the first unless examples are manually defined using this or
// another method such as registering them to swaggerOptions and referencing #/components/examples in docs)
// (tbh it would probably be nicer to do that and check that none are missing in tests/CI using this method)
export function injectOneOfExamples(spec: OpenAPIObject): void {
    const schemas = spec.components?.schemas ?? {};

    // walk all responses: for every path, for every operation, for every response,
    // grab the application/json media type, check if its schema uses oneOf, and if so,
    // pull the example from each referenced schema and inject it into mediaType.examples
    for (const pathObj of Object.values(spec.paths ?? {})) {
        for (const operation of Object.values(pathObj as Record<string, OperationObject>)) {
            for (const response of Object.values(operation.responses ?? {})) {
                const mediaType: MediaTypeObject | undefined = (response as ResponseObject)
                    ?.content?.['application/json'];

                if (!mediaType?.schema) continue;
                const schema = mediaType.schema as SchemaObject;
                if (!schema.oneOf) continue;
                // skip if examples were manually provided (which shouldn't
                // happen, but this is less confusing behavior)
                if (mediaType.examples) continue;

                const examples: Record<string, { summary: string; value: unknown }> = {};

                for (const variant of schema.oneOf) {
                    let ref = (variant as ReferenceObject).$ref;

                    // { type: "array", items: { $ref: ... } }
                    if (!ref) {
                        const asSchema = variant as SchemaObject;
                        if (
                            asSchema.type === 'array' &&
                            (asSchema.items as ReferenceObject)?.$ref
                        ) {
                            ref = (asSchema.items as ReferenceObject).$ref;
                        }
                    }

                    if (!ref) continue;

                    const schemaName = ref.split('/').pop()!;
                    const resolved = schemas[schemaName] as SchemaObject | undefined;
                    if (!resolved?.example) continue;

                    examples[schemaName] = {
                        summary: schemaName,
                        // wrap in an array if the variant is an array type
                        value:
                            (variant as SchemaObject).type === 'array'
                                ? [resolved.example]
                                : resolved.example,
                    };
                }
                if (Object.keys(examples).length > 0) {
                    mediaType.examples = examples;
                }
            }
        }
    }
}
