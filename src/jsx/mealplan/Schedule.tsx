import {
    Database
} from 'utils/Database';

import {
    DateTime,
    Interval,
} from 'luxon';

import {
    Recipe as RecipeInterface
} from 'utils/Database';


import { Close } from '@mui/icons-material';

export default function Schedule(
    props : {
        add:    any,
        remove: any,
    })
{
    const dateStart = DateTime.now().minus({'days': 1});
    const dateEnd   = DateTime.now().plus({'days': 10});
    const data = Interval
        .fromDateTimes(dateStart, dateEnd)
        .splitBy({days: 1})
        .map(d => {
            return {
                dateText: (d.start as DateTime).toFormat('MMM d - EEE'),
                dateISO:  (d.start as DateTime).toISODate(),
                recipes: Database.recipes.filter({cookdate: d.start?.toISODate()}).all(),
            };
        }) as {
            dateText: string,
            dateISO:  string,
            recipes:  RecipeInterface[]
        }[];

    return (
        <table>
            <tbody>
                {data.map(row => <>
                    <tr>
                        <td>{row.dateText}</td>
                        <td onClick={(e) => { if (e.target == e.currentTarget) props.add(row.dateISO) }}>
                            <RecipeList date={row.dateISO}
                                        recipes={row.recipes}
                                        remove={props.remove} />
                        </td>
                    </tr>
                </>)}
            </tbody>
        </table>
    );
}


