

import * as sql from 'sql';
import FileManager from 'utils/FileManager';

import {
    Database as SqliteDatabase
} from '@sqlite.org/sqlite-wasm';



/* Make this global so the Database & DatabaseQuery classes can both use it.
 *
 */
let db: SqliteDatabase;


/*
 *
 */
export interface Recipe {
    filepath:    string;
    name:        string;
    locale?:     string;
    makes?:      string;
    preptime?:   string;
    cooktime?:   string;
    vegan?:      string;
    vegetarian?: string;
    glutenfree?: string;
    cookdates:   string[];
    genre?:      string[];
    equip?:      string[];

}



interface RecipeTable {
    filepath:   string;
    name:       string;
    locale:     string;
    makes:      string;
    prepTime:   string;
    cookTime:   string;
    vegan:      boolean;
    vegetarian: boolean;
    glutenfree: boolean;
}














/*
 * 
 *
 * How to use:
 * 
 * Needs to be called on obsidian "layout-ready" event.
 *
 * Database.init("Food/Recipes/", "Food/Logs/Cooks.yaml");
 * Database.loadRecipes();
 * Database.loadCooks();
 * 
 * 
 */
export class Database {


    /*
     *
     */
    private static callbackList: (() => void)[] = [];
    

    /* Construct a new Database object.
     *
     * In the constructor we save the settings passed in and register
     * for file callbacks with the FileManager. The constructor can
     * be called immediately by the plugin, there is no need to wait
     * for onLayoutReady.
     *
     * Params:
     *    recipeRoot = the Obsidian path to the Recipe root folder
     *    cookPath   = the Obsidian path to the cook log file
     */
    static async init(recipeRoot: string, sqlite3: any) {

        // Initialize the database
        db = new sqlite3.oo1.DB('/mydb.sqlite3', 'c');
        db.exec(sql.create);

        FileManager.onCreate(recipeRoot, this.onCreate.bind(this));
        FileManager.onRename(recipeRoot, this.onRename.bind(this));
        FileManager.onModify(recipeRoot, this.onModify.bind(this));
        FileManager.onDelete(recipeRoot, this.onDelete.bind(this));
    }


    /**
     * Callback function to update the database when a recipe file is created.
     *
     * Note this also gets called on vault load and so it is used to fill
     * the database on startup as well.
     */
    static async onCreate(path: string) {
        console.debug(`Loading ${path}`)

        const frontMatter = await FileManager.readFrontmatter(path);

        // Insert the row corresponding to the recipe in the Recipes table
        this.insertRecipe(path, frontMatter);

        // Add values to the link tables that we find in frontmatter
        this.insertCooks(path,  frontMatter['dates']);
        this.insertGenres(path, frontMatter['genres']);
        this.insertEquip(path,  frontMatter['equipment']);

        // Notify listeners of changed database
        this.executeCallbacks();
    }


    /*
     *
     */
    static async onRename(path: string, oldPath: string) {
        console.debug(`Renaming ${oldPath} to ${path}`)
        this.onDelete(oldPath);
        this.onCreate(path);

        this.executeCallbacks();
    }


    /*
     *
     */
    static async onModify(path: string) {
        console.debug(`Updating ${path}`)

        const frontMatter = await FileManager.readFrontmatter(path);

        // Replace the row corresponding to the recipe in the Recipes table
        this.insertRecipe(path, frontMatter);

        // Add values to the link tables that we find in frontmatter
        this.insertCooks(path,  frontMatter['dates']);
        this.insertGenres(path, frontMatter['genres']);
        this.insertEquip(path,  frontMatter['equipment']);

        // Delete values from link tables that are no longer present in frontmatter
        this.deleteCooks(path,  frontMatter['dates']);
        this.deleteGenres(path, frontMatter['genres']);
        this.deleteEquip(path,  frontMatter['equipment']);

        // Notify listeners of changed database
        this.executeCallbacks();
    }


    /*
     *
     */
    static async onDelete(path: string) {
        console.debug(`Deleting ${path}`)
        this.deleteCooks(path);
        this.deleteGenres(path);
        this.deleteEquip(path);

        db.exec({
            sql: `
                DELETE FROM Recipes
                WHERE filepath = $recipe;
            `,
            bind: {$recipe: path}
        })

        this.executeCallbacks();
    }


    static async insertRecipe(path: string, frontMatter: any) {
        db.exec({
            sql: `
                INSERT OR REPLACE INTO Recipes (
                    filepath,
                    name,
                    locale,
                    makes,
                    preptime,
                    cooktime,
                    vegan,
                    vegetarian,
                    glutenfree
                ) VALUES (
                    $filepath,
                    $name,
                    $locale,
                    $makes,
                    $preptime,
                    $cooktime,
                    $vegan,
                    $vegetarian,
                    $glutenfree
                );`,
            bind: {
                $filepath: path,
                $name:     path.substring(1+path.lastIndexOf('/'),path.lastIndexOf('.')),
                $locale:     frontMatter['locale']     ?? null,
                $makes:      frontMatter['makes']      ?? null,
                $preptime:   frontMatter['prep time']  ?? null,
                $cooktime:   frontMatter['cook time']  ?? null,
                $vegan:      frontMatter['vegan']      ?? null,
                $vegetarian: frontMatter['vegetarian'] ?? null,
                $glutenfree: frontMatter['glutenfree'] ?? null,
            }
        });
        
    }


    /*
     *
     */
    static insertCooks  = this.insertLinkTable.bind(this, 'Cooks');
    static insertGenres = this.insertLinkTable.bind(this, 'Genres');
    static insertEquip  = this.insertLinkTable.bind(this, 'Equip');
    static async insertLinkTable(table: 'Cooks'|'Genres'|'Equip', path: string, values: string[]|undefined) {

        // Don't insert anything if the values are empty/undefined
        if (!values || values.length == 0) return;

        // Assign the column name based on the table name
        let column: string;
        switch (table) {
            case 'Cooks':  column = 'cookdate'; break;
            case 'Genres': column = 'genre';    break;
            case 'Equip':  column = 'equip';    break;
        }

        // Sqlite uses the ? character to denote a positional parameter that can be bound
        // to using the "bind" option in db.exec(...). For each row we are inserting (one
        // for each value passed in), we need two ? characters (path & value column).
        const binds = Array(values.length).fill('(?, ?)').join(',');

        // The values that we bind to the ? positional parameters need to be in an array
        // where they get bound to the question marks in the order they show up in the array.
        // We use the reduce function to get an alternating patter of path, value, etc.
        values = values.reduce((acc: string[], value: string) => [...acc, path, value], [])

        // Execute the SQL statement, using a Javascript template literal string
        // to fill in the table name & column name, and SQLite bind parameters
        // to fill in the actual values.
        db.exec({
            sql: `
                INSERT OR IGNORE INTO ${table} (
                    recipe,
                    ${column}
                ) VALUES ${binds};`,
            bind: values
        });
    }



    /*
     *
     */
    static deleteCooks  = this.deleteLinkTable.bind(this, 'Cooks');
    static deleteGenres = this.deleteLinkTable.bind(this, 'Genres');
    static deleteEquip  = this.deleteLinkTable.bind(this, 'Equip');
    static async deleteLinkTable(table: 'Cooks'|'Genres'|'Equip', path: string, values: string[]|undefined = undefined) {
       
        // If the values are undefined or empty, that means we want
        // to delete everything. Using an empty array for values will
        // cause the WHERE clause to match all the corresponding rows.
        if (!values) values = [];

        // Assign the column name based on the table name
        let column: string;
        switch (table) {
            case 'Cooks':  column = 'cookdate'; break;
            case 'Genres': column = 'genre';    break;
            case 'Equip':  column = 'equip';    break;
        }

        // Sqlite uses the ? character to denote a positional parameter that can be bound
        // to using the "bind" option in db.exec(...). For each value we don't want to
        // delete, we need to include a ? character so we can match it in the WHERE clause.
        const binds = Array(values.length).fill('?').join(',');
        
        // Execute the SQL statement, using a Javascript template literal string
        // to fill in the table name & column name, and SQLite bind parameters
        // to fill in the values to not delete.
        db.exec({
            sql: `
                DELETE FROM ${table}
                WHERE recipe = ?
                AND ${column} NOT IN (${binds});`,
            bind: [path, ...values]
        });
    }


    /*
     *
     */
    static get recipes() {
        return new RecipeQuery();
    }

    static save(recipe) {
        FileManager.writeFrontmatter(recipe.filepath, {
            genres: recipe.genre,
            locale: recipe.locale,
            makes: recipe.makes,
            preptime: recipe.preptime,
            cooktime: recipe.cooktime,
            vegan: recipe.vegan,
            vegetarian: recipe.vegetarian,
            glutenfree: recipe.glutenfree,
            dates: recipe.cookdates,

        })
    }


    /*
     *
     */
    static onChange(callback: ()=>void) {
        this.callbackList.push(callback);
    }


    /*
     *
     */
    static executeCallbacks() {
        for (const callback of this.callbackList) {
            callback();
        }
    }
}



interface QueryFilters {
    cookdate?:   string;
    cookdate__lt?:   string;
    cookdate__gt?:   string;
    cookdate__ge?:   string;
    cookdate__le?:   string;
    cookdate__ne?:   string;
    vegan?:      boolean;
    vegetarian?: boolean;
}

/* A class for querying Recipes from the database.
 *
 * Examples:
 *    - Recipe.objects.all()
 *    - Recipe.objects.filter({cookdate: '2024-01-01'}).get()
 *
 * TODO:
 *    - add exclude
 *    - add orderBy
 *    - add groupBy
 */
export class RecipeQuery {


    private filterFields: QueryFilters[];


    constructor(fields: QueryFilters[]|null = null) {
        this.filterFields = fields || [];
    }

    filter(fields: {}): RecipeQuery {
        return new RecipeQuery([...this.filterFields, fields]);
    }


    all(): Recipe[] {
        return this.query();
    }

    get(): Recipe|null {
        return this.query().first() || null;
    }


    /*
     *
     */
    private query(): Recipe[] {

        // TODO: add handling for less than, etc
        // TODO: add checking of filter fields (maybe via interface?)
        const clauses: string[] = [];
        for (const f of this.filterFields) {
            for (let [key,value] of Object.entries(f)) {
                if (typeof(value) === "boolean") value = 1;
                clauses.push(`${key} = '${value}'`);
            }
        }

        const where = clauses.join(' AND ') || '1';
        const replacements = {
            where: where,
        };

        let resultRows:RecipeTable[] = [];
        db.exec({
            sql: processTemplate(sql.get, replacements),
            rowMode: 'object',
            resultRows: resultRows as {}[],
        })

        // return resultRows.map(_ => {
        //     return new Recipe(_.filepath);
        // });
        return resultRows.map(recipe => {
            recipe['cookdates'] = JSON.parse(recipe['cookdates']);
            recipe['genres']    = JSON.parse(recipe['genres']);
            recipe['equip']     = JSON.parse(recipe['equip']);
            return recipe;
        });
    }


}

/* A helper function
 *
 */
function processTemplate(query: string, replacements: {[key: string]: string}) {
    return query.replace(/{(\w+)}/g,
        (placeholderWithDelimiters: string, placeholderWithoutDelimiters: string): string => {
            return replacements.hasOwnProperty(placeholderWithoutDelimiters) ? 
            replacements[placeholderWithoutDelimiters] : placeholderWithDelimiters
        })
}
