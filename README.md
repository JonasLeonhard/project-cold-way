# project-cold-way
> Bachelor Thesis Repository

## Table of contents
- [project-cold-way](#project-cold-way)
  - [Table of contents](#table-of-contents)
  - [General info](#general-info)
  - [Screenshots](#screenshots)
  - [Technologies](#technologies)
  - [Setup](#setup)
  - [Known Issues](#known-issues)
  - [Status](#status)
  - [Todo's](#todos)

## General info
This project is simple Lorem ipsum dolor generator.
![Project Proposal](./readme/architecture.png)

## Screenshots
- null 
## Technologies
Project is created with:
* Lorem version: 12.3
* Ipsum version: 2.33
* Ament library version: 999

## Setup
[Docker-compose] To run this project using docker compose
```bash
$ yarn up       # build containers
$ yarn start    # start containers 
$ yarn stop     # stop containers

```
[Local] To run this project, install it locally using yarn:
- requirements: setup postgres database at localhost:5432 -> see defaults at /cms/config/database.js
- install dependencies in /frontend & /cms (yarn)
```bash
$ cd frontend && yarn start
$ cd cms && yarn develop
```

[Docker] When you have an existing strapi database to restore to your new container:
```bash
$ sh helper.sh db-applybackup --container-name project_cold_way_postgres --file '/Users/Jonas/Desktop/dump-project_cold_way-202104181900.sql' --postgres-db-name project_cold_way --postgres-user postgres
```

## Known Issues
(Setup) When you have already setup a postgresql container for another project, the postgresql container skips creating the database of /postgres/1-schema.sql, because the local postgresql volume already contains a existing database. You can run the script manually and create the database by using the helper.sh script:
```bash
$ sh helper.sh db-applysql --container-name project_cold_way_postgres --schema 1-schema.sql --postgres-user postgres
```

## Status
- [x] _in progress_
- [ ] _finished_
- [ ] _no longer continued_ 

*this application is currently under development*

## Todo's

Environment:
- [x] add docker-compose setup for all architecture components

Frontend:
- [x] add component library to frontend (Ant Design)
- [ ] create pages for /books /author /room
- [ ] add user authentication + oauth
- [x] add websocket communication layer
- [ ] add webRTC communication layer (connector)

Backend:
- [x] add base "express" live server to backend (base.server)
- [x] add websocket communication layer to base.server 
- [ ] add node voice server to backend (voice.server)
- [ ] add node worker server to backend (worker.server)
- [ ] add rabbitMQ communication
- [ ] add WebRTC communication layer (receiver)

CMS:
- [ ] add book & author types
