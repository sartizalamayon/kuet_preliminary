const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.b6ckjyi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });


async function run() {
    try {
      await client.connect();
      console.log("Connected to MongoDB");

      app.get("/", (req, res) => {
        res.send("Hello World!");
      });

    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
      }
    }
    
run().catch(console.dir);

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${port}`);
}); 
