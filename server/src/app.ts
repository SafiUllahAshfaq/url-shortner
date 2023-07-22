import express from "express";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/ping", (_req, res) => {
  res.status(200).send("pong");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
