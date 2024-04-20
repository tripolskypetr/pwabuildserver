# pwabuildserver

> An easy-configurable CI/CD for PWA

## Usage

```
npm install -g pwabuildserver
pwabuildserver # in the project directory
```

## How to

This tool will automatically run `npm run build` shell command in the current directory when received GET request to `http://127.0.0.1:255/build`. Also, logs of last execution available on `http://127.0.0.1:255/logs`. The next `npm run build` is not starting until previous is finished or failed. Made expecially for [PM2](https://github.com/Unitech/pm2) and [https://github.com/pwalauncher](https://github.com/pwalauncher)
