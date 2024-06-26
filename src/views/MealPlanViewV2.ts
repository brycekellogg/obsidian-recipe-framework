import {
    App,
    TFile,
} from 'obsidian';

import { Eta } from 'eta';
import {DateTime, Interval} from 'luxon';

import * as templates from '../templates';

import SelectRecipeModal from '../SelectRecipeModal';
import RecipeFramework from '../main';


export default class MealPlanViewV2 {


    // ???
    eta : Eta;

    // The HTML element (div) this
    // view will be rendered into
    container:HTMLElement;

    logpath : string;
    recipepath : string;
    plugin : RecipeFramework;

    /**
     *
     **/
    constructor(database: RecipeFramework, source: string, container: HTMLElement) {
        this.container = container;
        this.database = database;

        this.eta = new Eta();
        this.eta.loadTemplate("@mealPlan", templates.MealPlanV2);
    }

    
    // Do the render and assign to the element.
    async renderMealPlan() {

        // await this.database.load();
        // const cooks = this.database.cooks();

        // console.log(cooks);

        // ???????
        const dateStart = DateTime.now().minus({'days': 1});
        const dateEnd   = DateTime.now().plus({'days': 10});
        const dates = Interval.fromDateTimes(dateStart, dateEnd)
                              .splitBy({days: 1})
                              .map((d) => d.start);

        // ????
        this.container.innerHTML = this.eta.render("@mealPlan", {
            // dates: dates,
            // today: DateTime.now(),
            // cooks: cooks,
        });
    }


    /**
     *
     **/
    async processMarkdown() {

        await this.renderMealPlan();

        // ???
        // this.container.addEventListener("click",    this.handleMealPlanClick.bind(this));
    }
};
