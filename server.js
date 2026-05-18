const { createServer } = require("http");
const next = require("next");

const hostname = "localhost";
const port = Number(process.env.PORT || 3000);
const app = next({ dev: true, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, hostname, () => {
    console.log(`FishOn Today ready on http://${hostname}:${port}`);
  });
});
