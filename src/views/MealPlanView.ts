import {
    App,
    TFile,
} from 'obsidian';

import { Eta } from 'eta';
import {DateTime, Interval} from 'luxon';

import * as templates from '../templates';

import RecipeLog from '../RecipeLog';
import SelectRecipeModal from '../SelectRecipeModal';
import RecipeFramework from '../main';


export default class MealPlanView {

    // ???
    recipelog : RecipeLog;

    // ???
    eta : Eta;

    // The HTML element (div) this
    // view will be rendered into
    container:HTMLElement;

    logpath : string;
    recipepath : string;
    plugin : RecipeFramework;
    app : App;

    /**
     *
     **/
    constructor(plugin: RecipeFramework, source: string, container: HTMLElement) {
        this.container = container;

        this.eta = new Eta();
        this.eta.loadTemplate("@mealPlan", templates.MealPlan);

        this.logpath = plugin.settings.LogPath;
        this.recipepath = plugin.settings.RecipePath;
        this.recipelog = new RecipeLog(app);

        this.app = app;
    }

    
    /**
     *
     **/
    async handleMealPlanClick(event:MouseEvent) {
        const add = (event.target as HTMLElement)?.classList.contains("meal-plan-recipe-list");
        const del = (event.target as HTMLElement)?.closest(".multi-select-pill-remove-button");
        const sel = (event.target as HTMLElement)?.closest(".multi-select-pill-content");
        if (del) return this.handleMealPlanDel(event);
        if (sel) return this.handleMealPlanSel(event);
        if (add) return this.handleMealPlanAdd(event);
    }


    /**
     *
     **/
    async handleMealPlanDel(event:MouseEvent) {
        const row = (event.target as HTMLElement).closest("tr");
        const timestamp = row?.dataset.timestamp;
        const name = ((event.target as HTMLElement)?.closest("[data-name]") as HTMLElement)?.dataset.name;

        if (!timestamp || !name) return;
        
        this.recipelog.del(timestamp, name);
        this.renderMealPlan();
        this.recipelog.write(this.logpath);
    }


    /**
     *
     **/
    async handleMealPlanSel(event : MouseEvent) {
        const name = ((event.target as HTMLElement)?.closest("[data-name]") as HTMLElement)?.dataset.name;
        const file = this.app.vault.getAbstractFileByPath(`${this.recipepath}/${name}.md`) as TFile;
        if (file) this.app.workspace.getLeaf("tab").openFile(file);
    }


    /**
     *
     **/
    async handleMealPlanAdd(event : MouseEvent) {

        // Get the row we clicked on
        const row = (event.target as HTMLElement).closest("tr");
        if (!row) return;
    
        // ???
        if (!row.dataset.timestamp) return;
        const timestamp = row.dataset.timestamp;
        new SelectRecipeModal(this, this.recipepath, this.logpath, timestamp).open();
    }


    // Do the render and assign to the element.
    async renderMealPlan() {

        // ???????
        const dateStart = DateTime.now().minus({'days': 2});
        const dateEnd   = DateTime.now().plus({'days': 10});
        const dates = Interval.fromDateTimes(dateStart, dateEnd)
                              .splitBy({days: 1})
                              .map((d) => d.start);

        // ????
        this.container.innerHTML = this.eta.render("@mealPlan", {
            dates: dates,
            log: this.recipelog,
        });
    }


    /**
     *
     **/
    async processMarkdown() {

        await this.recipelog.read(this.logpath);
        await this.renderMealPlan();

        // ???
        this.container.addEventListener("click",    this.handleMealPlanClick.bind(this));
    }
};
