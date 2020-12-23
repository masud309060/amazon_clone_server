const express = require('express');
const cors = require('cors');
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const port = 5000
const stripe = require('stripe')(`${process.env.STRIPE_APIKEY}`);

// app config 
const app = express()

// middleware 
app.use(cors({ origin:true }))
app.use(express.json())

//pass = rcn6FMfN5flXLku5
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASS_NAME}@cluster0.rrq7z.mongodb.net/<dbname>?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


// api route connect with mongoDB 
client.connect(err => {
  const orderCollection = client.db("amazonClone").collection("orders");

  app.post("/order/details", (req, res) => {
    const orderOne = req.body;
    orderCollection.insertOne(orderOne)
    .then(data => {
      res.status(201).send(data.insertedCount > 0)
    }).catch (err => {
      console.log(err)
    })

  })

  app.get("/order/details", (req, res) => {
    const email = req.query.email;
    orderCollection.find({"email": email})
    .toArray(( err, documents ) => {
        res.send(documents)
    })

  })

});


app.post("/payments/create", async (req, res) => {
  const total = req.query.total;

  console.log("Payment Request Recieved BOOM!!! for this amount >>> ", total);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: total, // subunits of the currency
    currency: "usd",
  });

  // OK - Created
  res.status(201).send({
    clientSecret: paymentIntent.client_secret,
  });
});

app.get("/", (req, res) => {
  res.status(200).send("hello world")
});

// app listener 
app.listen(process.env.PORT || port)