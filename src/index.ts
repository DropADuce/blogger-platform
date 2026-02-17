import express from "express";
import { startApp } from './app/app';
const app = express();

const port = process.env.PORT || 5001;

void startApp(app, () => {
  app.listen(port, () => {
    console.log(`Сервер стартанул на порту ${port}`);
  });
})
