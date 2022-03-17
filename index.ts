import express from "express";
import http from "http";
import path from "path";
import fs from "fs";
import { Server } from "socket.io";

process.stdin.resume();

const app = express();
const servlet = http.createServer(app);
const io = new Server(servlet);

interface Message extends Object {
    sender: string;
    content: string;
    _id?: string;
}

let messages: Message[] = [];

if(fs.existsSync(path.join(__dirname, "store.json")))
    messages = JSON.parse(
        fs.readFileSync(path.join(__dirname, "store.json")
    ).toString("utf-8"));

const handleExit = (exitCode: number) => {
    fs.writeFileSync(path.join(__dirname, "store.json"), JSON.stringify(messages, null, 4));
    process.exit(exitCode);
};

process.on("exit", handleExit);
process.on("SIGINT", handleExit);
process.on("SIGUSR1", handleExit);
process.on("SIGUSR2", handleExit);
process.on("SIGTERM", handleExit);
process.on("uncaughtException", handleExit);

io.on("connection", (s) => {
    console.log(`Socket connected with id: ${s.id}!`);
    messages.forEach((m) => {
        io.to(s.id).emit("recv", { content: m.content, sender: m.sender });
    });
    s.on("disconnect", () => {
        console.log(`Socket disconnected with id: ${s.id}!`);
    });
    s.on("message", (data: string) => {
        messages.push({ content: data, sender: s.id });
        console.log(`Message: ${data}`);
        io.emit("recv", { content: data, sender: s.id });
    });
});

app.use(express.static(__dirname));

servlet.listen(3000, () => {
    console.log("App listening on port 3000.");
});