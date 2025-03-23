/**
 * ???
 **/

import { DateTime } from 'luxon';

import {
    IconBackward,
    IconForward,
    IconMenu,
    IconToday,
} from 'jsx/mealplan'


interface Properties {
    date: DateTime;
    interval: 'month' | 'week' | 'day';
    onChange: (date: DateTime) => void;
}

/* The title block contains the currently selected month name
 * & year, controls for changing months, and the hamburger menu. */
export default function Header({date, interval, onChange} : Properties) {
    
    // Calculate the title based on the interval & date
    let title = '';
    switch (interval) {
        case 'month': title = date.toLocaleString({month: 'long', year: 'numeric'}); break;
        case 'week':  title = date.toLocaleString({month: 'long', year: 'numeric'}); break;
        case 'day':   title = date.toLocaleString({day: 'numeric', month: 'long', year: 'numeric'}); break;
    }

    // Calculate the change amount
    const onToday    = (_:any) => { onChange(DateTime.now()) };
    const onBackward = (_:any) => { onChange(date.minus({[interval]: 1}))};
    const onForward  = (_:any) => { onChange(date.plus( {[interval]: 1}))};

    // Something with hamburger menu
    const onMenu     = (_:any) => { };

    return (
        <div className="header">
            <IconToday onClick={onToday} />
            <div>
                <IconBackward onClick={onBackward} />
                {title}
                <IconForward  onClick={onForward} />
            </div>
            <IconMenu onClick={onMenu} />
        </div>
    );
}
