
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const authConfig = require('./auth_config.json');
const faker = require('faker');
const bodyParser = require("body-parser");
const bauth = require('basic-auth');

const app = express();

if (!authConfig.domain || !authConfig.audience) {
  throw 'Please make sure that auth_config.json is in place and populated';
}

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({// XXX:
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`,
  }),

  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithms: ['RS256'],
});


const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});


app.get('/api/menu', (req, res) => {
  res.json([
  {id: 1, name: "Pepperoni", description: "Lots of pepperoni, and lots of cheese! This firm favourite deserves it’s place at the top of the PizzazTin list.",
  ingredients: "Pizza sauce, mozzarella, pepperoni",image: "pepperoni.jpeg", price: 1.99},
  {id: 2, name: "Supreme", description: "Hot on the heels of pepperoni is Supreme, THE pizza I grew up with. The one rule I have about supreme? It’s gotta have at least TWO meats. Otherwise, it’s just another pizza…",
  ingredients: "Pizza sauce, mozzarella, bacon, onion, beef mince, capsicum, pepperoni, mushroom, olives",
  image: "supreme.jpeg", price: 1.99},
  {id: 3, name: "Hawaiian", description: "If you think you don’t like Hawaiian pizza, that’s because you haven’t tried homemade! I used to be one of “those people”",
  ingredients: "Pizza sauce, mozzarella, ham, pineapple",
  image: "hawaii.jpeg", price: 1.99},
  {id: 4, name: "BBQ Meatlovers", description: "You don’t even need to use a fancy BBQ sauce here. Any generic store bought BBQ sauce is fine – this one is all about the toppings!",
  ingredients: "BBQ sauce, mozzarella, pepperoni, bacon, cabanossi, beef mince, ham",
  image: "meatlovers.jpeg", price: 1.99},
  {id: 5, name: "Garlic butter prawns and chilli", description: "Huge Aussie favourite, a pizza topped with garlic prawns AND finished with a drizzle of garlic butter. Heaven in the form of a pizza!",
  ingredients: "Pizza sauce, mozzarella, garlic butter prawns, capsicum, onion, chilli, rocket",
  image: "prawn.jpeg", price: 1.99},
  {id: 6, name: "Sausage & Kale", description: "If there was ever a way to get someone to eat kale, this is it!",
  ingredients: "Pizza sauce, mozzarella, sausage, kale",
  image: "sausage.jpeg", price: 1.99},
  {id: 7, name: "Margherita", description: "Classic Italian favourite, one of the best examples of how simple is best! This pizza truly is magnificent.",
  ingredients: "Pizza sauce, buffalo mozzarella, basil, olive oil, salt",
  image: "margherita.jpeg", price: 1.99},
  ]);
});


function respond(res) {
  res.json({
    msg: "your order will be delivered in 30 min",
  });
}

app.post('/api/order', checkJwt, (req, res) => {
  console.log(req.user.sub + " -> " + req.body);
  setTimeout(respond, 1500, res);
});


app.get('/api/profile', checkJwt, async (req, res) => {
  try {
    const text = 'select given_name, family_name, address, address2, city, state, zip from customers where email = $1'
    const values = [req.user['https://pizza42.com/email']];
    const client = await pool.connect();
    const result = await client.query(text,values);
    if(result.rowCount == 1){
      res.status(200).json(result.rows[0]);
    } else {
      return res.status(500).send("sanity problem... the email was found on more than one account");
    }

    client.release();
  } catch (err) {
    console.error(err);
    return res.status(500).send("General Error");
  }
});

app.post('/api/profile', checkJwt, async (req, res) => {
  try {
    const text = `update customers set
      given_name = $2,
      family_name = $3,
      address = $4,
      address2 = $5,
      city = $6,
      state = $7,
      zip = $8 where email = $1
      RETURNING *`
    const values = [req.user['https://pizza42.com/email'],
                    req.body.given_name,
                    req.body.family_name,
                    req.body.address,
                    req.body.address2,
                    req.body.city,
                    req.body.state,
                    req.body.zip
                  ];
    const client = await pool.connect();
    const result = await client.query(text,values);
    if(result.rowCount == 1){
      res.status(200).json(result.rows[0]);
    } else {

      const insertText = `insert into customers
        ( email,
          given_name,
          family_name,
          address,
          address2,
          city,
          state,
          zip
      ) value ( $1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`

      const result = await client.query(text,values);
      if(result.rowCount == 1){
        res.status(200).json(result.rows[0]);
      } else {
        return res.status(500).send("sanity problem... the email was found on more than one account");
      }
    }

    client.release();
  } catch (err) {
    console.error(err);
    return res.status(500).send("General Error");
  }


});

app.get('/dump', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM customers');
      const results = { 'results': (result) ? result.rows : null};
      res.json( results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

  app.post('/api/login', async (req, res) => {
      try {
        var authentication = bauth(req);
        const text = 'select email from customers where email = $1 and password = $2'
        const values = [authentication.name, authentication.pass]
        const client = await pool.connect();
        const result = await client.query(text,values);
        if(result.rowCount == 1){
          res.status(200).json({"result": "success"});
        } else {
          return res.status(401).send("invalid username or password");
        }

        client.release();
      } catch (err) {
        console.error(err);
        return res.status(401).send("invalid username or password");
      }
    })

    app.post('/api/login', async (req, res) => {
        try {
          var authentication = bauth(req);
          const text = 'select email from customers where email = $1 and password = $2'
          const values = [authentication.name, authentication.pass]
          const client = await pool.connect();
          const result = await client.query(text,values);
          if(result.rowCount == 1){
            res.status(200).json({"result": "success"});
          } else {
            return res.status(401).send("invalid username or password");
          }

          client.release();
        } catch (err) {
          console.error(err);
          return res.status(401).send("invalid username or password");
        }
      })

    app.post('/api/idlookup', async (req, res) => {
        try {

          const text = 'select email from customers where email = $1'
          const values = [req.body.email]
          const client = await pool.connect();
          const result = await client.query(text,values);
          if(result.rowCount == 1){
            res.status(200).json({"result": "success"});
          } else {
            return res.status(401).send("invalid username");
          }

          client.release();
        } catch (err) {
          console.error(err);
          return res.status(401).send("invalid username");
        }
      })

const port = process.env.PORT || 3001;

app.listen(port, () => console.log(`Api started on port ${port}`));
