const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const connect = require("./schemas");
const goodsRouter = require("./routers/goods");

const app = express();

app.use(
  morgan("dev"),
  bodyParser.json(),
  bodyParser.urlencoded({ extended: false })
);
app.use(express.static(__dirname + "/public"));
app.use("/api", [goodsRouter]);
app.set("port", process.env.PORT || 3000);

app.set("views", __dirname + "/views");
app.engine("html", require("ejs").renderFile);
connect();

app.get("/", (req, res) => {
  res.render("index.html");
});

app.get("/goods", (req, res) => {
  res.render("goods.html");
});

app.get("/order", (req, res) => {
  res.render("order.html");
});

app.get("/cart", (req, res) => {
  res.render("cart.html");
});

app.get("/detail", (req, res) => {
  res.render("detail.html");
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "포트 에서 대기중...");
});
