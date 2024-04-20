#!/usr/bin/env node

import { spawn } from 'child_process';

import express from "express";
import nocache from 'nocache';
import cors from 'cors';

const isWin = process.platform === "win32";

class BuildProcess {
    status = "ready"
    output = "";
    constructor(command) {
        this._command = command;
    }
    launch = (args = []) => {
        const exec = spawn(this._command, args);
        exec.stdout.on('data', (data) => {
            this.output += `${data.toString()}`;
        });
        exec.stderr.on('data', (data) => {
            this.output += `${data.toString()}`;
        });
        exec.on('error', function(err) {
            this.output += `${err.toString()}`;
            this.status = "error";
        });
        exec.on('close', () => {
            this.status = "end";
        });
        this.status = "begin";
        this.output += `Execution started: ${new Date().toString()}\n`;
        return this;
    }
}

const createExecutor = (command = isWin ? "npm.cmd" : "node") => {
    let executorRef = new BuildProcess(command);
    const wrappedFn = (args = ["run", "build"]) => {
        if (executorRef.status === "error") {
            return executorRef;
        }
        if (executorRef.status === "ready") {
            executorRef.launch(args);
        }
        if (executorRef.status === "end") {
            executorRef = new BuildProcess(command).launch(args);
        }
        return executorRef;
    };
    wrappedFn.getLogs = () => executorRef.output;
    return wrappedFn;
};

const execute = createExecutor();

const app = express();

app.use(nocache());
app.use(cors());

app.get('/build', (req, res) => {
    const logs = execute().output;
    res.status(200).send(`<pre>${logs}</pre>`);
});

app.get('/logs', (req, res) => {
    const logs = execute.getLogs();
    res.status(200).send(`<meta http-equiv="refresh" content="15"><pre>Logs:\n${logs}</pre>`);
});

app.get("*", (req, res) => {
    res.status(404).send("Not found");
});

app.listen(255, "0.0.0.0", () => {
    console.log(`Server started: PORT=255`);
});
