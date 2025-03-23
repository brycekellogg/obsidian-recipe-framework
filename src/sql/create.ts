const query = `

CREATE TABLE Recipes (
    filepath    TEXT PRIMARY KEY,
    name        TEXT,
    locale      TEXT,
    makes       TEXT,
    preptime    TEXT,
    cooktime    TEXT,
    vegan       INTEGER,
    vegetarian  INTEGER,
    glutenfree  INTEGER
);

CREATE TABLE Cooks (
    recipe   TEXT NOT NULL,
    cookdate TEXT NOT NULL,
    PRIMARY KEY (recipe, cookdate),
    FOREIGN KEY(recipe) REFERENCES recipes(filepath)
);

CREATE TABLE Genres (
    recipe  TEXT,
    genre   TEXT,
    PRIMARY KEY (recipe, genre),
    FOREIGN KEY(recipe) REFERENCES recipes(filepath)
);

CREATE TABLE Equip (
    recipe TEXT,
    equip  TEXT,
    PRIMARY KEY (recipe, equip),
    FOREIGN KEY(recipe) REFERENCES recipes(filepath)
);

`
export default query;
