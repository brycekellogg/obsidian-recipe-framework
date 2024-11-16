
import Ajv from 'ajv';

/*
 * Cook file format:
 *    ```yaml
 *    2024-01-20[meal=dinner]:
 *       - Food/Recipes/Paella.md
 *       - Food/Recipes/Rice.md
 *    2024-01-21[meal=lunch]:
 *       - Food/Recipes/Pasta.md
 *    ```
 */
const SCHEMA_COOKS = {
    type: 'object',
    additionalProperties: false,
    patternProperties: {
        '^[0-9]{4}-[0-9]{2}-[0-9]{2}$': {
            type: 'array',
            items: {
                type: 'string',
                pattern: '\\.md$',
            }
        }
    }
}

const SCHEMA_RECIPE = {
    type: 'object',
    properties: {
        genre: {
            type: "array",
            items: {type: "string"},
        },
        locale: {
            type: "string",
        }
    }
}

const Schema = new Ajv();
Schema.addSchema(SCHEMA_COOKS,  'cooks');
Schema.addSchema(SCHEMA_RECIPE, 'recipe');

export default Schema;
