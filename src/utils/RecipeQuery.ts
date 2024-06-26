

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
// class RecipeQuery {
//
//
//     // ???
//     data: [string, RecipeQuery][] | Recipe[];
//
//
//     /*
//      *
//      */
//     constructor(data: [string, RecipeQuery][] | Recipe[]) {
//         this.data = data;
//     }
//
//
//     /*
//      *
//      */
//     push(r: Recipe) {
//         // TODO: check this is a Recipe[]
//         return this.data.push(r);
//     }
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
//     [Symbol.iterator]() {
//
//         // ???
//         if (this.data instanceof Array) return this.data[Symbol.iterator]();
//         // if (this.data instanceof Map)   return this.data[Symbol.iterator]();
//
//         // ???
//         throw new Error("Invalid RecipeQuery");
//     };
// }
