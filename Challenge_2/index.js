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

        const db = client.db("MofaKitchenBuddy"); // Database name
        const userIngredientsCollection = db.collection("UserIngredients"); // Collection

        /*
        API: Add a New Ingredient
        Route: /ingredients
        Method: POST
        Sample Payload:
        {
          "name": "Sugar",
          "quantity": 2,
          "unit": "kg"
        }
        Sample Response:
        {
          "message": "Ingredient added",
          "id": "648df63f93a2f234e4567890"
        }
        */
        app.post("/ingredients", async (req, res) => {
            const ingredient = req.body;
            try {
                const result = await userIngredientsCollection.insertOne(ingredient);
                res.status(201).send({ message: "Ingredient added", id: result.insertedId });
            } catch (error) {
                res.status(500).send({ error: "Failed to add ingredient" });
            }
        });

        /*
        API: Retrieve All Ingredients
        Route: /ingredients
        Method: GET
        Sample Response:
        [
          {
            "_id": "648df63f93a2f234e4567890",
            "name": "Sugar",
            "quantity": 2,
            "unit": "kg",
            "last_updated": "2024-12-21T14:58:00.000Z"
          },
          {
            "_id": "648df63f93a2f234e4567891",
            "name": "Flour",
            "quantity": 1.5,
            "unit": "kg",
            "last_updated": "2024-12-21T14:58:00.000Z"
          }
        ]
        */
        app.get("/ingredients", async (req, res) => {
            try {
                const ingredients = await userIngredientsCollection.find().toArray();
                res.status(200).send(ingredients);
            } catch (error) {
                res.status(500).send({ error: "Failed to retrieve ingredients" });
            }
        });

        /*
        API: Update an Ingredient
        Route: /ingredients/:id
        Method: PUT
        Sample Payload:
        {
          "quantity": 3,
          "unit": "kg"
        }
        Sample Response:
        {
          "message": "Ingredient updated"
        }
        */
        app.put("/ingredients/:id", async (req, res) => {
            const { id } = req.params;
            const updatedData = req.body;
            try {
                const result = await userIngredientsCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: updatedData }
                );
                if (result.matchedCount === 0) {
                    res.status(404).send({ error: "Ingredient not found" });
                } else {
                    res.status(200).send({ message: "Ingredient updated" });
                }
            } catch (error) {
                res.status(500).send({ error: "Failed to update ingredient" });
            }
        });

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


