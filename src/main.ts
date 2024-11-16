import {
    App,
    Plugin,
} from 'obsidian';


import * as views   from './views';
import Database from 'utils/Database';
import { Settings } from './settings';


import {
    FileManager,
} from 'utils';


const DEFAULT_SETTINGS : Settings = {
    LogPath: "Food/Logs",
    RecipePath: "Food/Recipes",
    CookPath: "Food/Logs/Cooks.yaml",
}



export default class RecipeFramework extends Plugin {

    settings: Settings;
    database: Database;

    /**
     *
     **/
    async onload() {
        await this.loadSettings();
        
        
        // Register markdown clode block processors
        // this.registerMarkdownCodeBlockProcessor("recipe-mealplan",  (source, container) => new views.MealPlanView (this, source, container).processMarkdown());
        this.registerMarkdownCodeBlockProcessor('recipe-mealplan-v2',  (source, container) => new views.MealPlanViewV2 (source, container));
        this.registerMarkdownCodeBlockProcessor('recipe-query',        (source, container) => new views.RecipeQueryView(source, container));
        // this.registerMarkdownCodeBlockProcessor("recipe-recommend", (source, container) => new views.RecommendView(this, source, container).processMarkdown());
        // this.registerMarkdownCodeBlockProcessor("recipe-genres",    (source, container) => new views.GenresView   (this, source, container).processMarkdown());
        // this.registerMarkdownCodeBlockProcessor("recipe-index",     (source, container) => new views.IndexView    (this, source, container).processMarkdown());
        
        this.app.workspace.on("layout-ready", () => {
            FileManager.init(this.app.vault);
            Database.init(this.settings.RecipePath, this.settings.CookPath);
            Database.loadRecipes();
            Database.loadCooks();
        });
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
};

