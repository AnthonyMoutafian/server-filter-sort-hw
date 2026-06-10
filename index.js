const http = require("http");
const fs = require("fs").promises;
const { createPath } = require("./helpers/createPath");
const { headerGenerator } = require("./helpers/headerGenerator");
const { defaultResGenerator } = require("./helpers/defaultResGenerator");
const PORT = 3000;

const server = http.createServer(async (req, res) => {
  if (req.url === "/") {
    defaultResGenerator(res, "text/html", ["pages"], "index.html", 200);
  } else if (req.url.match(/\/api\/users\/([0-9]+)/) && req.method === "GET") {
    const id = Number(req.url.split("/").pop());
    const users = JSON.parse(
      await fs.readFile(createPath("db", "users.json"), "utf-8"),
    );
    const currentUser = users.find((user) => {
      return user.id === id;
    });
    headerGenerator(200, "application/json", res);
    res.write(JSON.stringify(currentUser));
    res.end();
  } else if (req.url.startsWith("/api/users") && req.method === "GET") {
    const filteredUsers = [];

    const users = JSON.parse(
      await fs.readFile(createPath("db", "users.json"), "utf-8"),
    );

    if (req.url.includes("?age=")) {
      const age = req.url.split("?age=").pop();

      if (age === "min") {
        users.sort((a, b) => a.age - b.age);
      }

      if (age === "max") {
        users.sort((a, b) => b.age - a.age);
      }
    }

    if (req.url.includes("?name=")) {
      const query = req.url.split("?name=").pop().toLowerCase();

      users.forEach((user) => {
        if (user.name.toLowerCase().includes(query)) {
          filteredUsers.push(user);
        }
      });

      headerGenerator(200, "application/json", res);
      res.write(JSON.stringify(filteredUsers));
      res.end();
      return;
    }

    headerGenerator(200, "application/json", res);
    res.write(JSON.stringify(users));
    res.end();
  } else {
    defaultResGenerator(res, "text/html", ["pages"], "error.html", 404);
  }
});

server.listen(PORT, (err) => {
  err ? console.log(err) : console.log(`Server Is Running On Port ${PORT}`);
});
