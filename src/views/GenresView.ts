import {
    App,
    TFile,
} from 'obsidian';

import { Eta } from 'eta';

import RecipeFramework from '../main';
import RecipeLog from '../RecipeLog';



const templates = {
    
    view:`
        <div>
            <p>bryce test genre view</p>
        </div>
    `,
}




/**
 *
 * Metrics:
 *    - time since last made
 *    - how many times made
 *    - genre last made
 *    - genre weight
 **/
export default class GenresView {

    // ???
    plugin: RecipeFramework;
    
    // The HTML element (div) this
    // view will be rendered into
    container: HTMLElement;

    // ???
    eta: Eta;

    getMarkdownFiles: any;
    
    /**
     *
     **/
    constructor(plugin: RecipeFramework, source: string, container: HTMLElement) {
        this.plugin = plugin;
        this.container = container;
        
        this.eta = new Eta();
        this.eta.loadTemplate("@view", templates.view);
        
        this.getMarkdownFiles = this.plugin.app.vault.getMarkdownFiles.bind(this.plugin.app.vault);
    }

    
    async getRecipeList():Promise<TFile[]> {
        return this.plugin.app.vault
                   .getMarkdownFiles()
                   .filter((x:TFile) => x?.parent?.path == this.plugin.settings.RecipePath);
    }

    /**
     *
     **/
    async processMarkdown() {
        // Get list of all recipes (made or not)
        let data = (await this.getRecipeList())
                                .map((x:TFile) => {
            return x.basename;
        });
        // console.log(data);
        
        this.container.innerHTML = this.eta.render("@view", {});
        // await this.recipelog.read(this.plugin.settings.LogPath);

    }
};
