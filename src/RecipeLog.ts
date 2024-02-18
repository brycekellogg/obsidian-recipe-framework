import {
    App,
    TFile,
    TFolder,
} from 'obsidian';


export default class RecipeLog {

    /// A reference to the Obsidian App; used to access
    // Obsidian API functions like reading/writing files.
    app : App;
   

    /// The cache where we store log data.
    cache : Map<string, string[]>;


    /**
     * Constructs a new RecipeLog object.
     *
     * Params:
     *    app = a reference to the Obsidian App
     **/
    constructor(app : App) {
        this.app = app;
    }

    
    /**
     * Read the recipe cache from disk.
     *
     * This function reads the frontmatter of the logfiles located in the
     * `logpath` directory, parses it, and saves it in the class variable
     * `cache`.
     *
     * FrontMatter is expected to be of the form:
     *     {
     *         "2023-10-30": ["ramen", "paella"],
     *         ... etc ...
     *     }
     * where each key is an ISO date & each value is a list of recipe names.
     *
     * Note: this function reads from disk and will be slow; try not to block.
     *
     * Params:
     *    logpath = the path to a folder containing the logs
     **/
    async read(logpath: string) {

        // Each read wipes out the cache and starts fresh
        this.cache = new Map<string, string[]>;

        // The logpath is expected to be a folder containing
        // files with the correctly formatted FrontMatter.
        const logDir = this.app.vault.getAbstractFileByPath(logpath) as TFolder;
      
        // Iterate over the files in the logpath folder and use Obsidian's
        // functions to read the FrontMater, parse it, and save to the cache.
        for (const logFile of logDir?.children) {
            await this.app.fileManager.processFrontMatter(logFile as TFile, fm => {
                Object.entries(fm).forEach(([datestring, names]) => {
                    this.cache.set(datestring, names as string[]);
                });
            });
        }
    }


    /**
     * Write the recipe cache to disk.
     *
     * This function writes the frontmatter of the logfiles located in the
     * `logpath` directory from the values stored in the class variable
     * `cache`.
     *
     * FrontMatter will be written out in the form:
     *     {
     *         "2023-10-30": ["ramen", "paella"]
     *         ... etc ...
     *     }
     * where each key is an ISO date & each value is a list of recipe names.
     * Entries will only be written to log files that match the key year.
     *
     * Notes: this function writes to disk and will be slow; try not to block.
     *
     * Params:
     *    logpath = the path to a folder containing logs
     **/
    async write(logpath : string) {

        // Same as with read, the logpath is expected to be a folder
        // containing files with the correctly formatted FronMatter.
        const logDir = this.app.vault.getAbstractFileByPath(logpath) as TFolder;

        // Iterate over the files in the logpath folder and write out the
        // cache entries to them if year matches the file name.
        for (const logFile of logDir?.children) {
            const year = (logFile as TFile).basename;
            await this.app.fileManager.processFrontMatter(logFile as TFile, (fm) => {
                for (const [key,value] of this.cache.entries()) {
                    if (!key.startsWith(year)) continue;
                    fm[key] = value.length ? value : undefined;
                }
            });
        }
    }


    /**
     * Get the recipes for a given date.
     *
     * Params:
     *    date = an ISO date to get recipes for
     *
     * Returns:
     *    a list of strings corresponding to recipe names or an
     *    ampy list if no recipes are logged for that date.
     **/
    get(date : string) : string[] {
        return this.cache.get(date) || [];
    }


    /**
     * Add a recipe to a given date.
     *
     * Params:
     *    date = an ISO date to add the recipe to
     *    name = the name of the recipe to add
     **/
    add(date : string, name : string) {
        this.cache.get(date)?.push(name) || this.cache.set(date, [name]);
    }


    /**
     * Remove a recipe from a given date.
     *
     * Params:
     *    date = an ISO date to remove the recipe from
     *    name = the name of the recipe to remove
     **/
    del(date : string, name : string) {
        this.cache.set(date, this.cache.get(date)?.filter(_ => _ != name) || []);
    }
};
