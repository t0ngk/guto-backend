const express = require("express");
const app = express();
const user = require("./routes/user");
const pet = require("./routes/pet");
const appointment = require("./routes/appointment");
const state = require("./routes/state");

app.use(express.json());

app.use("/assets", express.static("assets"));

app.use("/user", user);
app.use("/pet", pet);
app.use("/appointment", appointment);
app.use("/state", state);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(3000, () => {
  console.log("app listening on port 3000!");
});
