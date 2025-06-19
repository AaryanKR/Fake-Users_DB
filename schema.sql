-- show tables;
-- show databases;
create table user (
    id varchar(50) primary key,
    username varchar(40) unique,
    email varchar(50) unique not null,
    password varchar(40) not null
);
