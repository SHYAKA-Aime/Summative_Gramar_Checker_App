// server.js
const http = require("http");

// Your two deployed app URLs from Render:
const servers = [
  "https://aime-web01.onrender.com/",
  "https://aime-web02.onrender.com/"
];

let current = 0;

const server = http.createServer((req, res) => {
  // Round-robin: alternate between Web01 and Web02
  const target = servers[current];
  current = (current + 1) % servers.length;

  // Redirect user to selected server
  res.writeHead(302, { Location: target });
  res.end();
});

server.listen(process.env.PORT || 8080, () => {
  console.log("Load balancer running...");
});
