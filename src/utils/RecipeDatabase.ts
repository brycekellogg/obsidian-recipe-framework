import {
    Vault,
    TAbstractFile,
    TFile,
    TFolder,
} from 'obsidian';

import { Settings } from '../settings';

/*
 */
import { _ } from 'lodash';

/**
 *
 */
import { DateTime } from 'luxon';
import YAML from 'yaml';


/*
 *  Note: must be called after workspace.onLayoutReady().
 */
export default class RecipeDatabase {

    vault: Vault;
    settings: Settings;

    db: Map<string, Recipe>;
    cookDB: CookLog; 
    
    
    /**
     *
     *
     */
    constructor(vault: Vault, settings: Settings) {
        this.vault    = vault;
        this.settings = settings;

        this.db = new Map<string, Recipe>();
        this.cookDB = new CookLog();

        this.vault.on('modify', file => _(file.parent.path).startsWith(this.settings.RecipePath) && this.load());
        this.vault.on('create', file => _(file.parent.path).startsWith(this.settings.RecipePath) && this.load());
        // TODO: how to handle delete?
        // TODO: how to handle rename?
    }

    
    /**
     *
     * 
     *
     */
    async load() {
        const recipePath: string  = this.settings.RecipePath;
        const recipeRoot: TFolder = this.vault.getFolderByPath(recipePath);
        
        const cookPath: string  = this.settings.LogPath;
        const cookRoot: TFolder = this.vault.getFolderByPath(cookPath);
        
        if (recipeRoot == null) throw new Error(`Recipe Path "${recipePath}" not found`);
        if (cookRoot   == null) throw new Error(`Cook Path "${cookPath}" not found`);
        
        await this.loadRecipes(recipeRoot);
        await this.loadCooks(cookRoot);
    }

    
    /**
     *
     *
     */
    async loadRecipes(root: TFolder) {

        // Buld a list of recipe files
        const recipeList: TFile[] = this.findFiles(root, ['md']);

        // Populate the recipe database
        for (const recipeFile: TFile of recipeList) {
            const recipePath: string = recipeFile.path;
            if (!this.db.has(recipePath)) {
                this.db.set(recipePath, new Recipe(recipeFile));
            }
        }

        // Have all the recipes load their data
        for (const [path, recipe] of this.db) {
            await recipe.load();
        }
    }


    /**
     *
     */
    async loadCooks(root: TFolder) {

        // Build a list of cook files
        const fileList: TFile[] = this.findFiles(root, ['yml', 'yaml']);

        // Get all the cook contents
        let yamlList = {};
        for (const cookFile: TFile of fileList) {
            const contents: string = await cookFile.vault.cachedRead(cookFile);
            const yaml = YAML.parse(contents);
            yamlList = {...yamlList, ...yaml};
        }

        // Convert to recipes
        let cookList = {};
        for (const cookDate in yamlList) {
            for (const recipePath of yamlList[cookDate]) {
                this.cookDB.add(cookDate, this.db.get(recipePath) || "NOPE");
            }
        }
        console.log(cookList);
    }

    
    /**
     * Find files.
     *
     * This function examines the children of the root TFolder and either adds
     * them to the list of recipes or recurses if the child is a TFolder. This
     * allows recipes to be nested in subfolders.
     *
     * Note: this function considers all files to be recipes. There
     *       is currently no checking of file extension or content.
     *
     * Params:
     *    - root = the root folder in which to look for recipes
     *    - exts = a list of file extension to match
     *
     * Returns: a list of files corresponding to all the recipes
     *          recursively found under the root folder.
     */
    findFiles(root: TFolder, exts: string[] = []): TFile[] {
        let fileList: TFile[] = [];
        
        for (const child: TAbstractFile of root.children) {
            if (child instanceof TFolder) fileList = [...fileList, ...this.findFiles(child, exts)];
            if (child instanceof TFile && exts.includes(child.extension)) fileList = [...fileList, child];
        }
        
        return fileList;
    }

    

    recipes() {
        // return new RecipeQuery(Object.values(Object.values(this.db)));
    }


    /**
     * Returns the log as a RecipeQuery. I can then group by day and use
     * where queries to subset
     */
    cooks() {

    }

}


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
class RecipeQuery {


    // ???
    data: [string, RecipeQuery][] | Recipe[];


    /*
     *
     */
    constructor(data: [string, RecipeQuery][] | Recipe[]) {
        this.data = data;
    }


    /*
     *
     */
    push(r: Recipe) {
        // TODO: check this is a Recipe[]
        return this.data.push(r);
    }

    
    /*
     * 
     */
    groupBy(key: string) {

        const data = _(this.data)
            .map(r => { _.isNil(r[key])    && (r[key] = [undefined]); return r; })
            .map(r => { _.isString(r[key]) && (r[key] = [r[key]]);    return r; })
            .map(r => _(r[key]).map(k =>  r.clone({groupKey: k})).value())
            .flatten()
            .groupBy('groupKey')
            .toPairs()
            .map(g => [g[0], new RecipeQuery(g[1])])
            .sortBy(g => g[0] == 'undefined' ? undefined : g[0])
            .value();

        return new RecipeQuery(data);
    }

    
    /*
     *
     */
    [Symbol.iterator]() {

        // ???
        if (this.data instanceof Array) return this.data[Symbol.iterator]();
        // if (this.data instanceof Map)   return this.data[Symbol.iterator]();

        // ???
        throw new Error("Invalid RecipeQuery");
    };
}


/*
 *
 */ 
class Recipe {

    valid: bool;
    file: TFile;
    name: string;
    genre: string[];
    locale: string;
    equipment: string[];
    mtime: number|undefined = undefined;
   
    
    /**
     *
     *
     *
     */
    constructor(file: TFile) {
        this.file  = file;
    }


    /**
     *
     *
     */
    async load() {
        const mtime = this.file.stat.mtime;
        if (this.mtime == undefined || this.mtime < mtime) {
          
            // ?????
            const contents: string = await this.file.vault.cachedRead(this.file);
            const frontMatter: string = contents.match(/^---(.+?)---/s)[1];
            const props = YAML.parse(frontMatter);

            // ?????
            this.mtime = mtime;
            this.genre = props.genre;
            this.name = this.file.basename;
        }
    }
}


/**
 *
 *
 */
class CookLog {

    get(cookDate, index) {
        return undefined;
    }

    add(cookDate, recipe) {
        console.log(recipe);
    }

    drop(cookDate, recipe) {

    }
}


/**
 * Corresponds to a time when a Recipe was made.
 *
 */
class Cook {
    recipe: Recipe;
    date: DateTime;
    meal: string;   // TODO: change to enum
    notes: strings; // TODO: should have the #Log section for this date
}

