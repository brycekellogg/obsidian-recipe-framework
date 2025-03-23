/**
 * 
 */

import {
    MouseEventHandler
} from 'react';

import {
    DateTime,
    Interval
} from 'luxon';

import {
    Header,
    CalendarDay,
} from 'jsx/mealplan'

import Database from 'utils/Database';


/**
 * Represents a meal plan "Month" calendar view
 *
 * Params:
 *    date = the target date that determines
 *           which month to show.
 *    onForward = a callback function to call
 *                when the forward button is clicked
 *    onBackward = a callback function to call
 *                 when the back button is clicked
 *    onDayNumber = a callback function to call
 *                  when the number of a day is clicked
 *    onCookAdd = a callback function to call when
 *                the body of a day is clicked to
 *                add a new cook.
 */
export default function MonthView({
    date,
    onForward,
    onBackward,
    onDayNumber,
    onCookAdd,
}: {
    date: DateTime,
    onForward: MouseEventHandler,
    onBackward: MouseEventHandler,
    onDayNumber: MouseEventHandler,
    onCookAdd: MouseEventHandler,
}) {

    // Calculate the list of DateTime objects that will
    // end up being dispayed in the month view calendar
    // Note: we always display a full six weeks
    const calendarStart: DateTime = date.startOf('month').startOf('week')
    const calendarEnd:   DateTime = calendarStart.plus({'week': 6})
    const dates: DateTime[] = Interval
       .fromDateTimes(calendarStart, calendarEnd)
       .splitBy({days: 1})
       .map(_ => _.start)
       .filter(_ => _ != null)

    // DEBUGGING
    const onChange = (_:any) => console.log("onChange");
    const interval = 'month';


    // Specify the HTML elements via JSX syntax
    return (
        <>
            <Header date={date} interval={interval} onChange={onChange} />
            <div className="month-view">

                {/* The calendar block contains all the
                  * days that show meal plan contents. */}
                <div className="calendar">
                    <div className="week"><p>M</p></div>
                    <div className="week"><p>T</p></div>
                    <div className="week"><p>W</p></div>
                    <div className="week"><p>T</p></div>
                    <div className="week"><p>F</p></div>
                    <div className="week"><p>S</p></div>
                    <div className="week"><p>S</p></div>

                    {dates.map((date: DateTime) =>
                        <CalendarDay date={date} interval={interval} onChange={onChange}/>)}
                </div>
            </div>
        </>
    );
}

