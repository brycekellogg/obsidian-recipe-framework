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
        const root: TAbstractFile|null = this.vault.getAbstractFileByPath(rootPath);

        // If it's not found, return empty list
        if (root == null) return [];
        
        // If it's a file, return its path unless the extension doesn't match
        if (root instanceof TFile) {
            return exts.includes(root.extension) ? [root.path] : [];
        }
        
        let fileList: string[] = [];
        for (const child of (root as TFolder).children) {
            fileList = [...fileList, ...this.findFiles(child.path, exts)];
            // if (child instanceof TFolder) fileList = [...fileList, ...this.findFiles(child.path, exts)];
            // if (child instanceof TFile && exts.includes(child.extension)) fileList = [...fileList, child.path];
        }

        return fileList;
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
        const file: TAbstractFile|null = this.vault.getAbstractFileByPath(path);
        if (file instanceof TFile) {
            const contents: string = await this.vault.cachedRead(file);
            return contents;
        } else {
            return '';
        }
    }

    static async write(path: string, contents: string) {
        const file: TAbstractFile|null = this.vault.getAbstractFileByPath(path);
        if (file instanceof TFile) {
            this.vault.modify(file, contents);
        }
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
