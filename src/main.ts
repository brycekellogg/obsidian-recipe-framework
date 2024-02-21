import {
    App,
    Editor,
    MarkdownView,
    Modal,
    Notice,
    Plugin,
    PluginSettingTab,
    Setting,
    FuzzySuggestModal,
    TFile,
    MarkdownPostProcessorContext,
} from 'obsidian';

import {
    MealPlanView,
    RecommendView,
    GenresView,
} from './views';



interface RecipeFrameworkSettings {
    LogPath:string;
    RecipePath:string;
}

const DEFAULT_SETTINGS : RecipeFrameworkSettings = {
    LogPath: "Food/Logs",
    RecipePath: "Food/Recipes",
}




export default class RecipeFramework extends Plugin {

    settings:RecipeFrameworkSettings;

    /**
     *
     **/
    async onload() {
        await this.loadSettings();

        // Register a markdown clode block processor
        this.registerMarkdownCodeBlockProcessor("recipe-mealplan",  (source, container) => new MealPlanView (this, source, container).processMarkdown());
        this.registerMarkdownCodeBlockProcessor("recipe-recommend", (source, container) => new RecommendView(this, source, container).processMarkdown());
        this.registerMarkdownCodeBlockProcessor("recipe-genres",    (source, container) => new GenresView   (this, source, container).processMarkdown());
    }


    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
};


