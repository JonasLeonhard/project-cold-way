# project-cold-way
> Bachelor Thesis Repository

## Table of contents
* [General info](#general-info)
* [Screenshots](#screenshots)
* [Technologies](#technologies)
* [Setup](#setup)
* [Status](#status)
* [Todo's](#todo's)

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
To run this project, install it locally using npm:
```bash
$ yarn start
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

Frontend:
- [ ] add component library to frontend (Ant Design)
- [ ] create pages for /books /author /room
- [ ] add user authentication + oauth
- [ ] add websocket communication layer
- [ ] add webRTC communication layer (connector)

Backend:
- [ ] add base "express" live server to backend (base.server)
- [ ] add websocket communication layer to base.server 
- [ ] add node voice server to backend (voice.server)
- [ ] add node worker server to backend (worker.server)
- [ ] add rabbitMQ communication
- [ ] add WebRTC communication layer (receiver)

CMS:
- [ ] add book & author types