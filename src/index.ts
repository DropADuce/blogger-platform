import express from "express";

const app = express();

const port = process.env.PORT || 5001;

app.get("/", async (req, res) => {
  res.send("Hello World!!!");
})

app.listen(port, () => {
  console.log(`Сервер стартанул на порту ${port}`);
})