const query = `

/* This begins a transaction
 * 
 */
BEGIN;

INSERT INTO Recipes (
        filepath,
        name,
        locale,
        makes,
        preptime,
        cooktime,
        vegan,
        vegetarian,
        glutenfree
    ) VALUES (
        :filepath,
        :name,
        :locale,
        :makes,
        :preptime,
        :cooktime,
        :vegan,
        :vegetarian,
        :glutenfree
    );

INSERT INTO Cooks (
        recipe,
        cookdate
    ) VALUES
        {cooks};

INSERT INTO Genres (
        recipe,
        genre
    ) VALUES
        {genres};

INSERT INTO Equip (
        recipe,
        equip
    ) VALUES
        {equip};

COMMIT;
`
export default query;
