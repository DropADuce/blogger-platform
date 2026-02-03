import express from "express";
import { setupApp } from './setup-app';

const app = express();

setupApp(app);

const port = process.env.PORT || 5001;

app.listen(port, () => {
  console.log(`Сервер стартанул на порту ${port}`);
})