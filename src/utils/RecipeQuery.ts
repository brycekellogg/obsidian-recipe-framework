
import Recipe      from 'utils/Recipe';

/* List format:
 *     [Recipe, Recipe, Recipe]
 *     
 * Dict format: 
 *     {
 *         "key0": RecipeQuery,
 *         "key1": RecipeQuery
 *     }
 * 
 */
export default class RecipeQuery {

    /* This tells typescript that we can use ['key'] stuff
     * 
     * https://www.typescriptlang.org/docs/handbook/2/objects.html#index-signatures
     */
    readonly [key: string]: any;


    private static proxyHandlers = {
        get(target: any, key: string) {
            if (Reflect.has(target, key))      return Reflect.get(target, key);

            switch (key) {
                case 'length': return target.data.length;  // TODO: this can just be a public readonly variable that gets updated when we change data
                default: return target.map.get(key) || new Recipe(key);  // needed becsue we can't do this in the template
            }
        },
    };

    static new(recipeMap: Map<string, Recipe>) {
        const query = new RecipeQuery(recipeMap);
        return new Proxy(query, this.proxyHandlers);
    }

    // ???
    data: [string, RecipeQuery][] | Recipe[];
    map: Map<string, Recipe>;


    /*
     *
     */
    constructor(recipeMap: Map<string, Recipe>) {
        this.data = Array.from(recipeMap.values());
        this.map = recipeMap;
    }
//
//
//     /*
//      *
//      */
    push(r: string) {
//         // TODO: check this is a Recipe[]
//         return this.data.push(r);
    }
//
//     
//     /*
//      * 
//      */
//     groupBy(key: string) {
//
//         const data = _(this.data)
//             .map(r => { _.isNil(r[key])    && (r[key] = [undefined]); return r; })
//             .map(r => { _.isString(r[key]) && (r[key] = [r[key]]);    return r; })
//             .map(r => _(r[key]).map(k =>  r.clone({groupKey: k})).value())
//             .flatten()
//             .groupBy('groupKey')
//             .toPairs()
//             .map(g => [g[0], new RecipeQuery(g[1])])
//             .sortBy(g => g[0] == 'undefined' ? undefined : g[0])
//             .value();
//
//         return new RecipeQuery(data);
//     }
//
//     
//     /*
//      *
//      */
    [Symbol.iterator]() {

        // ???
        if (this.data instanceof Array) return this.data[Symbol.iterator]();
        // if (this.data instanceof Map)   return this.data[Symbol.iterator]();

        // ???
        throw new Error("Invalid RecipeQuery");
    };
}
