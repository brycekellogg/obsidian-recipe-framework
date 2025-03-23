
import { DateTime } from 'luxon';
import { Database } from 'utils/Database';

interface Properties {
    date: DateTime;
    interval: 'month' | 'week' | 'day';
    onChange: (date: DateTime) => void;
}


/* The title block contains the currently selected month name
 * & year, controls for changing months, and the hamburger menu. */
export default function CalendarDay({date, interval, onChange} : Properties) {
    const isToday = DateTime.now().toISODate() === date.toISODate() ? true : false;
    const dayLabel = date.toLocaleString({day: 'numeric'})

    const onDayNumber = (_:any) => onChange(date)

    return (
        <div className="day" data-today={isToday} data-date={date.toISODate()}>
            <a className="day-link" onClick={onDayNumber}>{dayLabel}</a>
            <CookList date={date}/>
        </div>
    );
}


function CookList({date}) {
    const cooks = Database.cooks[date.toISODate()];

    const onAdd = () => {};
    const onLink = () => {};

    return (
        <div onClick={onAdd}>
            {cooks.map((recipePath: string) => 
                <a className="recipe-link" data-path={recipePath} onClick={onLink}>
                    {Database.recipes[recipePath].basename}
                </a>
            )}
        </div>
    );
}
