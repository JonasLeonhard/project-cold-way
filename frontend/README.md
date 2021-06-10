## Run locally

Steps to start the app.

0. Install dependencies
```bash
$ yarn
```
### 1. Local Setup
[Environment Variables] Setup .env files

when running the application with yarn dev | yarn start, make sure
to have contents of .env.localhost in .env
```bash
$ yarn env:local
```

### 2. Start the application
```bash
$ yarn dev
```


[Antd] Update Stylesheet
- Vars list can be found at: https://ant.design/docs/react/customize-theme
- to update vars in the stylesheets add eg. --modify-var=@primary-color=#1C7C54 to package.json script (build:antd)
- to render update vars in the stylesheet run:
```bash
$ yarn build:antd
```

# Antd
this project used antd design components. Rebuild the ant.min.css
with:
```bash
$ yarn build:antd
```
Change theme parameters for antd in ./helper.sh -> $modifyVars. A list of modifyVars can be found at https://ant.design/docs/react/customize-theme