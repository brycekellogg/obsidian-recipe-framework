import {
    Vault,
    TAbstractFile,
    TFile,
    TFolder,
} from 'obsidian';

import {
    DateTime,
} from 'luxon';


export default class FileManager {

    static vault: Vault;


    /**
     *
     *
     */
    static init(vault: Vault) {
        this.vault = vault;
    //     this.vault.on('modify', file => _(file.parent.path).startsWith(this.settings.RecipePath) && this.load());
    //     this.vault.on('create', file => _(file.parent.path).startsWith(this.settings.RecipePath) && this.load());
        // TODO: how to handle delete?
        // TODO: how to handle rename?
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
    static findFiles(rootPath: string, exts: string[] = []): string[] {
    //     const recipePath: string  = this.settings.RecipePath;
    //     const recipeRoot: TFolder = this.vault.getFolderByPath(recipePath);
    //     
    //     const cookPath: string  = this.settings.LogPath;
    //     const cookRoot: TFolder = this.vault.getFolderByPath(cookPath);
    //     
    //     if (recipeRoot == null) throw new Error(`Recipe Path "${recipePath}" not found`);
    //     if (cookRoot   == null) throw new Error(`Cook Path "${cookPath}" not found`);
    //     
    //     let fileList: TFile[] = [];
    //     
    //     for (const child: TAbstractFile of root.children) {
    //         if (child instanceof TFolder) fileList = [...fileList, ...this.findFiles(child, exts)];
    //         if (child instanceof TFile && exts.includes(child.extension)) fileList = [...fileList, child];
    //     }
    //     
        // return fileList;
        return [];
    }


    /**
     *
     *
     */
    static modified(path: string): DateTime|undefined {
        return DateTime.now();
    }
    

    /**
     *
     *
     */
    static async read(path: string): Promise<string> {
    //     const file: TFile = this.vault.getFileByPath(path);
    //     const contents: string = await this.vault.cachedRead(file);
    //     return contents;
        return "";
    }

    static async write(path: string, contents: string) {

    }



    static onModify(root: string, callback: (path: string) => void) {

    }
    
    static onCreate(root: string, callback: (path: string) => void) {

    }
    
    static onDelete(root: string, callback: (path: string) => void) {

    }
    
    static onRename(root: string, callback: (oldPath: string, newPath: string) => void) {

    }
}
