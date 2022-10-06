
const express = require('express');

const cors = require('cors');

const values = []

for(let i = 0; i < 1000; i++) {
  values.push({
    title: `item ${i}`,
    writer: `${i}${i}`
  })
}

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: false}));

app.use((req, res, next) => {
  console.log(req.url);
  next();
})

app.delete("/del", (req, res) => {
  const idx = parseInt(req.query['idx'])

  values.splice(idx, 1);

  return res.send(200);
})

app.post("/front", (req, res) => {
  
  values.unshift(req.body)

  return res.send(200);
})

app.get("/page", (req, res) => {

  const per_page = parseInt(req.query['per_page']);
  const page = parseInt(req.query['page']);

  const start = (page - 1) * per_page;

  return res.json({
    totalCount: values.length,
    items: values.slice(
      Math.min(start, values.length),
      Math.min(start + per_page, values.length)
    )
  });

})

app.listen(8080, ()=> console.log('hello'))