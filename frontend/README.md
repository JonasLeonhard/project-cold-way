## Run locally

Steps to start the app.

0. Install dependencies
```bash
$ yarn
```

### 1. Docker Compose setup
when running the application in a docker container, make sure the 
contents of .env.docker are in .env.development or .env.production

```bash
$ cp .env.docker .env.development
$ cp .env.docker .env.production
```

### 1. Local Setup
[Environment Variables] Setup .env files

when running the application with yarn dev | yarn start, make sure
to have contents of .env.localhost in .env.development | .env.prodiction
```bash
$ cp .env.localhost .env.development
$ cp .env.localhost .env.production
```

### 2. Start the application
```bash
$ yarn dev
```