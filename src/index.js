import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import connectDb from "./db/index.js";
import { app } from "./app.js";

connectDb()
  .then(() => {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log("connected to mondodb, connection instance is", process.env.MONGODB_URI?.slice?.(0, 30) || "db-info");
      console.log("App listening at port", PORT);
    });
  })
  .catch((error) => {
    console.log("MONGO_DB connection failed " + error);
  });
