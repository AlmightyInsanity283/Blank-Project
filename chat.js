import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";

const socket = io();

const censored = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
};

const message = (str) => {
    const keys = Object.keys(censored);
    for(let i = 0; i < keys.length; i++) {
        str = str.replaceAll(keys[i], censored[keys[i]]);
    }
    str = str.replace(/((?:https?|ftp|ssh|.+)\:\/?\/?(?:[^(?:\/|\s)]+)?\/?[^\s]+)/gm, `<a href="$1">$1</a>`);
    return str;
};

socket.on("connect", () => {
    const form = document.getElementById("message-form");
    const messages = document.getElementById("messages");
    const msg = document.getElementById("msg");
    const submit = document.getElementById("submit");
    let isSubmitting = false;
    form.addEventListener("submit", () => {
        if (msg.value.replace(/\s/gm, "") == "" || isSubmitting) return;
        isSubmitting = true;
        submit.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i>`;
        socket.emit("message", message(msg.value));
        msg.value = "";
    });
    socket.on("recv", (data) => {
        if (data.sender == socket.id) {
            isSubmitting = false;
            submit.innerHTML = `<i class="fas fa-paper-plane"></i>`;
        }
        messages.innerHTML += `<li><b>${data.sender}:</b> ${data.content}</li>`;
    });
});