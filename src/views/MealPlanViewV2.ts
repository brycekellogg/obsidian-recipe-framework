
import { Eta } from 'eta';
import {DateTime, Interval} from 'luxon';

import * as templates from '../templates';

import { Database }          from 'utils/Database';
import SelectRecipeModal from 'utils/SelectRecipeModal';


export default class MealPlanViewV2 {


    // ???
    eta : Eta;


    // The HTML element (div) this
    // view will be rendered into
    container: HTMLElement;


    /**
     *
     **/
    constructor(source: string, container: HTMLElement) {
        this.container = container;
        this.container.addEventListener("click",   this.handleClick.bind(this));

        // Configure drag & drop support
        this.container.addEventListener("dragstart", (event) => {
            console.log(event);
            console.log(event.srcElement.closest('span.cook'));
            event.dataTransfer.setData('date', event.srcElement.dataset.date);
            event.dataTransfer.setData('path', event.srcElement.dataset.href);
        });
        this.container.addEventListener("dragover", (event) => event.preventDefault());
        this.container.addEventListener("drop", this.handleDrop.bind(this));

        // Initialize template engine
        this.eta = new Eta();
        this.eta.loadTemplate("@mealPlan", templates.MealPlanV2);

        Database.onChange(() => {
            this.renderMealPlan();
        });
        
        this.renderMealPlan();
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


    /*
     *
     */
    handleDrop(event: DragEvent) {
        const newDate = event.srcElement.dataset.date;
        const oldDate = event.dataTransfer.getData('date');
        const path = event.dataTransfer.getData('path');

        // Database.cooks[oldDate].drop(path);
        // Database.cooks[newDate].add(path);
        // Database.writeCooks();
    }

    
    /*
     *
     */ 
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
            Database.cooks[event.target.dataset.date].add(recipePath);
            Database.writeCooks();
        }
    }


    /*
     *
     */ 
    async handleDel(event: PointerEvent) {
        const recipePath: string = event.target.dataset.path;
        Database.cooks[event.target.dataset.date].drop(recipePath);
        Database.writeCooks();
    }    
};

