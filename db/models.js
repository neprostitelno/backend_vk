/*
const pg = require("pg");

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_ROOT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 5432,
};

const client = new pg.Client(config);

client.connect(err => {
    if (err) throw err;
    else {
        queryDatabase();
    }
});

function queryDatabase() {
    const query = `
    create table if not exists users
    (
        id         serial primary key,
        login      varchar(256) not null unique,
        password   varchar(256) not null,
        email      varchar(256),
        name       varchar(32)  not null,
        surname    varchar(32),
        icon       varchar(256),
        birthday   date,
        city       varchar(64),
        university varchar(128)
    );
    create table if not exists friends
    (
        id          serial primary key,
        followerID  integer not null references users,
        followingID integer not null references users,
        unique (followerID, followingID)
    );
    
    create table if not exists posts
    (
        id          serial primary key,
        authorID    integer not null references users,
        title       varchar(256) not null,
        content     varchar(1024) not null,
        postDate    date not null
    );
    
    create table if not exists messages
    (
        id          serial primary key,
        userFromID  integer not null references users,
        userToID    integer not null references users,
        message     varchar(1024) not null,
        messageDate date not null
    );
`;

    client
        .query(query)
        .then(() => {
            console.log('Table created successfully!');
            client.end(console.log('Closed client connection'));
        })
        .catch(err => console.log(err))
        .then(() => {
            console.log('Finished execution, exiting now');
            process.exit();
        });
}

module.exports = client;
*/
