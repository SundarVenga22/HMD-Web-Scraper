CREATE DATABASE hmd_app;
USE hmd_app;

CREATE TABLE pico5 (
    id integer PRIMARY KEY AUTO_INCREMENT,
    sectionHeading TEXT,
    specHeading TEXT,
    body TEXT,
    created TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE pico5promax (
    id integer PRIMARY KEY AUTO_INCREMENT,
    sectionHeading TEXT,
    specHeading TEXT,
    body TEXT,
    created TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE pimaxreality12kqled (
    id integer PRIMARY KEY AUTO_INCREMENT,
    sectionHeading TEXT,
    specHeading TEXT,
    body TEXT,
    created TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE xrealair2ultra (
    id integer PRIMARY KEY AUTO_INCREMENT,
    sectionHeading TEXT,
    specHeading TEXT,
    body TEXT,
    created TIMESTAMP NOT NULL DEFAULT NOW()
);

