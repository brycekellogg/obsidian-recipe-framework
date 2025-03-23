
import { DateTime, DurationLike } from 'luxon';
import { createRoot } from 'react-dom/client';

import { Database  }        from 'utils/Database';
import SelectRecipeModal from 'utils/SelectRecipeModal';
import {
    Month
} from 'jsx/mealplan';


/**
 *
 *
 */
export default class MealPlanViewV3 {

    root;
    targetDate: DateTime;
    interval: string;

    /**
     *
     **/
    constructor(source: string, container: HTMLElement) {
        this.targetDate = DateTime.now();
        this.root = createRoot(container);
        this.interval = 'month';
        Database.onChange(() => this.render());
        this.render();
    }

    
    // Do the render and assign to the element.
    async render() {
        this.root.render(
            <Month date = {this.targetDate}
                   onForward   = { this.onDateChange.bind(this, {'month': +1}, 'month') }
                   onBackward  = { this.onDateChange.bind(this, {'month': -1}, 'month') }
                   onDayNumber = { this.onDateChange.bind(this, {           }, 'week' ) }
                   onCookAdd   = { this.onCookAdd.bind(this)} />);
    }


    /**
     *
     *
     */
    async onDateChange(change: DurationLike, interval: string, event: PointerEvent) {
        event.stopPropagation();
        this.targetDate = this.targetDate.plus(change);
        this.interval = interval;
        this.render();
    }


    /*
     *
     */
    async onCookAdd(event: PointerEvent) {
        const recipePath: string = await new SelectRecipeModal().show();
        const cookDate: string = event.target.dataset.date;
        if (recipePath && cookDate) {
            Database.cooks[cookDate].add(recipePath);
            Database.writeCooks();
        }
    }


    /*
     *
     */ 
    // async handleDel(event: PointerEvent) {
    //     const recipePath: string = event.target.dataset.path;
    //     Database.cooks[event.target.dataset.date].drop(recipePath);
    //     Database.writeCooks();
    // }    
};

