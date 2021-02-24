const express = require("express");
const Goods = require("../schemas/Goods");
const Cart = require("../schemas/Cart");

const cheerio = require("cheerio");
const axios = require("axios");
const iconv = require("iconv-lite");
const url =
  "http://www.yes24.com/24/Category/BestSeller";

const router = express.Router();

router.get("/goods/cart", async (req, res, next) => {
  try {
    const goods = await Goods.find({});
    res.json(goods);
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get("/goods", async (req, res, next) => {
  try {
    const { category } = req.query;
    const goods = await Goods.find({ category }).sort("-goodsId");
    res.json({ goods: goods });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get("/goods/:goodsId", async (req, res) => {
  const { goodsId } = req.params;
  goods = await Goods.findOne({ goodsId: goodsId });
  res.json({ detail: goods });
});

router.post("/goods/:goodsId/cart", async (req, res) => {
  const { goodsId } = req.params;
  const { quantity } = req.body;

  isCart = await Cart.find({ goodsId });
  console.log(isCart);
  if (isCart.length) {
    await Cart.updateOne({ goodsId }, { $set: { quantity } });
  } else {
    await Cart.create({ goodsId: goodsId, quantity: quantity });
  }
  res.send({ result: "success" });
});

router.get("/cart", async (req, res) => {
  const cart = await Cart.find({});
  const goodsId = cart.map((cart) => cart.goodsId);

  goodsInCart = await Goods.find().where("goodsId").in(goodsId);

  concatCart = cart.map((c) => {
    for (let i = 0; i < goodsInCart.length; i++) {
      if (goodsInCart[i].goodsId == c.goodsId) {
        return { quantity: c.quantity, goods: goodsInCart[i] };
      }
    }
  });

  res.json({
    cart: concatCart,
  });
});

router.delete("/goods/:goodsId/cart", async (req, res) => {
  const { goodsId } = req.params;

  const isGoodsInCart = await Cart.find({ goodsId });
  if (isGoodsInCart.length > 0) {
    await Cart.deleteOne({ goodsId });
  }

  res.send({ result: "success" });
});

router.get("/goods/add/crawling", async (req, res) => {

  try {
    await axios({
      url: url,
      method: "GET",
      responseType: "arraybuffer",
    }).then(async (html) => {
      const content = iconv.decode(html.data, "EUC-KR").toString();
      const $ = cheerio.load(content);
      const list = $("ol li");

      await list.each( async (i, tag) => {
        let desc = $(tag).find("p.copy a").text() 
        let image = $(tag).find("p.image a img").attr("src")
        let title = $(tag).find("p.image a img").attr("alt")
        let price = $(tag).find("p.price strong").text()
        price = price.slice(0,-1).replace(/(,)/g, "")
        if(desc && image && title && price){
          let date = new Date()
          let goodsId = date.getTime()
          await Goods.create({
            goodsId:goodsId,
            name:title,
            thumbnailUrl:image,
            category:"도서",
            price:price
          })
        }
  
      });
  
    });
    res.send({ result: "success", message: "크롤링이 완료 되었습니다." });
    
  } catch (error) {
    console.log(error)
    res.send({ result: "fail", message: "크롤링에 문제가 발생했습니다", error:error });
  }
  
});

module.exports = router;
