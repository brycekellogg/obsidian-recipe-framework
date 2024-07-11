
import { Eta } from 'eta';
import {DateTime, Interval} from 'luxon';

import * as templates from '../templates';

import Database          from 'utils/Database';
import SelectRecipeModal from 'utils/SelectRecipeModal';
// import RecipeFramework from '../main';


export default class MealPlanViewV2 {


    // ???
    eta : Eta;

    // The HTML element (div) this
    // view will be rendered into
    container:HTMLElement;

    logpath : string;
    recipepath : string;
    // plugin : RecipeFramework;

    /**
     *
     **/
    constructor(source: string, container: HTMLElement) {
        this.container = container;

        this.eta = new Eta();
        this.eta.loadTemplate("@mealPlan", templates.MealPlanV2);

        Database.onChange(() => {
            this.renderMealPlan();
        });
    }

    
    // Do the render and assign to the element.
    async renderMealPlan() {

        // ???????
        const dateStart = DateTime.now().minus({'days': 1});
        const dateEnd   = DateTime.now().plus({'days': 10});
        const dates = Interval.fromDateTimes(dateStart, dateEnd)
                              .splitBy({days: 1})
                              .map((d) => d.start);

        // ????
        this.container.innerHTML = this.eta.render("@mealPlan", {
            dates: dates,
            today: DateTime.now(),
            cooks: Database.cooks,
            recipes: Database.recipes,
        });
    }

    async handleClick(event: PointerEvent) {
        const add = (event.target as HTMLElement)?.classList.contains('cooks');
        const del = (event.target as HTMLElement)?.classList.contains('delete');
        if (add) return this.handleAdd(event);
        if (del) return this.handleDel(event);
    }


    /*
     *
     */
    async handleAdd(event: PointerEvent) {
        const recipePath: string = await new SelectRecipeModal().show();
        if (recipePath) {
            Database.cooks[event.target.dataset.cookid].add(recipePath);
            Database.writeCooks();
        }
    }

    async handleDel(event: PointerEvent) {
        const recipePath: string = event.target.dataset.path;
        const cookID:     string = event.target.dataset.cookid;
        Database.cooks[event.target.dataset.cookid].drop(recipePath);
        Database.writeCooks();
    }

    /**
     *
     **/
    async processMarkdown() {

        await this.renderMealPlan();

        // ???
        this.container.addEventListener("click", this.handleClick.bind(this));
    }
};
