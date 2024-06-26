import FileManager from 'utils/FileManager';
import Recipe      from 'utils/Recipe';
import Schema      from 'utils/Schema';

import {
    parse as parseYaml,
    stringify as stringifyYaml,
} from 'yaml';


/*
 */
export default class Database {

    
    /* Data structure for storing Recipes.
     *
     * Each Recipe is uniquely identified by its full path, which acts as
     * the key into our recipeMap. Recipes paths genreally look something
     * like: "Food/Recipes/Gilled Chicken.md"
     *
     * This data scructure is only ever written to by the loadRecipes()
     * function; the only way to add a Recipe is by creating the
     * corresponding file in Obsidian under the recipeRoot directory.
     * */
    private recipeMap: Map<string, Recipe> = new Map<string, Recipe>()

    
    /* Data structure for storing cook information.
     *
     * Each cook is uniquely identified by the date & meal that it
     * corresponds to. The key into the cookMap consists of a date in
     * RFC 9557 format with the additional "meal" tag. Cook IDs generally 
     * look something like: "2024-06-29[meal=dinner]" with supported meals
     * being ["breakfast", "lunch", "dinner", "other"].
     *
     * Each value in the cookMap consists of a list of Recipe paths. We use
     * paths instead of Recipe objects so that a refresh of the recipeMap
     * doesn't invalidate the cookMap. Instead, each recipeObject needs to
     * be looked up based on the path found in the cookMap.
     */
    private cookMap: Map<string, string[]> = new Map<string, string[]>();

    
    /* The Obsidian path to the root folder containing Recipe files.
     *
     * All markdown files found recursively under
     * this root folder are considered Recipes.
     */
    private recipeRoot: string;


    /* The Obsidian path to the cook log file.
     *
     * Cooks are all stored in a single file that gets read
     * on load and written to when the cooks are modified.
     */
    private cookPath:   string;


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
    constructor(recipeRoot: string, cookPath: string) {
        this.recipeRoot = recipeRoot;
        this.cookPath   = cookPath;

        FileManager.onModify(this.recipeRoot, () => this.loadRecipes());
        FileManager.onCreate(this.recipeRoot, () => this.loadRecipes());
        FileManager.onDelete(this.recipeRoot, (path: string) => {
            this.deleteRecipe(path);
        });
        FileManager.onRename(this.recipeRoot, (oldPath: string, newPath: string) => {
            this.renameRecipe(oldPath, newPath)
            this.loadRecipes();
        });
    }

    
    /* Load recipes from disk.
     *
     * This function gets the list of all the recipe files under the root and
     * saves them into the recipeMap. Once the recipeMap is fully populated,
     * each recipe is loaded via the Recipe.load() function; the function
     * waits for all Recipes to complete loading before returning.
     *
     * Note: this will only add new recipes if they didn't already exist in
     *       the recipeMap. The Recipe.load() function checks the file
     *       modification time and will only reload the file if it is newer
     *       than the last time the Recipe was loaded.
     */
    async loadRecipes() {

        // Buld a list of recipe files
        const recipePathList: string[] = FileManager.findFiles(this.recipeRoot, ['md']);
   
        // Populate the recipe database
        for (const recipePath of recipePathList) {
            if (!this.recipeMap.has(recipePath)) {
                this.recipeMap.set(recipePath, new Recipe(recipePath));
            }
        }

        // Have all the recipes load their data
        for (const [path, recipe] of this.recipeMap) {
            await recipe.load();
        }
    }


    /*
     * Load cooks from disk.
     *
     *
     * file format is descibed in utils/Schema.ts
     *
     */
    async loadCooks() {

        // Get all the cook contents
        const contents: string = await FileManager.read(this.cookPath);
        const cookYaml = parseYaml(contents);
        if (!cookYaml) return;
        
        // Validate that the file matches our schema
        const valid = Schema?.getSchema('cooks')?.(cookYaml);
        if (!valid) return;
        
        // Add cooks to the database & convert paths to recipes
        for (const cookID in cookYaml) {
            this.cookMap.set(cookID, []);
            for (const recipePath of cookYaml[cookID]) {
                this.cookMap.get(cookID)?.push(recipePath);
            }
        }
    }


    /*
     *
     */
    async writeCooks() {
        this.cookMap = new Map<string, string[]>([...this.cookMap.entries()].sort());
        const contents: string = stringifyYaml(this.cookMap);
        FileManager.write(this.cookPath, contents);
    }


    /*
     *
     */
    renameRecipe(oldPath: string, newPath: string) {
        for (const [_, recipeList] of this.cookMap) {
            recipeList.forEach((path,i) => {
                if (path == oldPath) {
                    recipeList[i] = newPath;
                }
            });
        }
    }

    
    /*
     *
     */
    deleteRecipe(path: string) {
        this.recipeMap.delete(path);
    }

    
    /*
     *
     *
     */
    cookGetByID(cookID: string): string[]|undefined {
        return this.cookMap.get(cookID);
    }


    /*
     *
     */
    cookAdd(cookID: string, recipePath: string) {
        const recipeList: string[] = this.cookMap.get(cookID) || [];
        recipeList.push(recipePath)
        this.cookMap.set(cookID, recipeList); 
    }


    /*
     *
     */
    cookDrop(cookID: string, recipePath: string) {
        const recipeList: string[]|undefined = this.cookMap.get(cookID)?.filter(path => path != recipePath);
        if (recipeList && recipeList.length) {
            this.cookMap.set(cookID, recipeList);
        } else {
            this.cookMap.delete(cookID);
        }
    }


    /*
     *
     */
    cookCount() {
        return this.cookMap.size;
    }

    
    /*
     *
     */
    private cookProxyHandlers = {
        get(target: any, key: string) {
            switch (key) {
                case 'length': return target.cookCount();
                default:
                    const recipeList: string[]|undefined = target.cookGetByID(key);
                    if (!recipeList) return undefined;
                    
                    Reflect.defineProperty(recipeList, 'drop', {value: target.cookDrop.bind(target, key)});
                    Reflect.defineProperty(recipeList, 'add',  {value: target.cookAdd.bind(target, key)});
                    return recipeList;
            }
        },
    };
    cooks = new Proxy(this as any, this.cookProxyHandlers);
}

