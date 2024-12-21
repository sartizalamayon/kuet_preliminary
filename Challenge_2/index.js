const express = require('express');
const cors = require('cors');
require('dotenv').config();
//
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs').promises;
const multer = require("multer"); 

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

const genAI = new GoogleGenerativeAI(process.env.GeminiApi);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json"
};

async function processRecipeWithGemini(recipeText) {
  const chatSession = model.startChat({ generationConfig });
  const result = await chatSession.sendMessage(recipeText);
  const response = result.response.text();
  
  // Remove markdown formatting if present
  const cleanJson = response.replace(/```json\n|```/g, '');
  return JSON.parse(cleanJson);
}

app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.b6ckjyi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const upload = multer({ dest: "uploads/" });

// Function to process text or image with Gemini API
async function processRecipe(inputText) {
  try {
    const chatSession = model.startChat({ generationConfig });
    const result = await chatSession.sendMessage(inputText);

    // Extract and clean the response
    const response = result.response.text();
    const cleanJson = response.replace(/```json\n|```/g, "");
    return JSON.parse(cleanJson); // Parse the response into JSON
  } catch (error) {
    console.error("Error processing recipe:", error);
    throw new Error("Failed to process recipe with Gemini API.");
  }
}


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

        const recipeCollection = db.collection("Recipe");
        const recipeIngredientsCollection = db.collection("RecipeIngredients");


        app.post("/recipes", upload.single("file"), async (req, res) => {
          try {
              const { recipeText } = req.body;
              let recipeData;
      
              // Process recipe from file or text
              if (req.file) {
                  const filePath = req.file.path;
                  const fileContent = await fs.readFile(filePath, "utf8");
                  recipeData = await processRecipe(fileContent);
                  // Cleanup uploaded file
                  await fs.unlink(filePath);
              } else if (recipeText) {
                  recipeData = await processRecipe(recipeText);
              } else {
                  return res.status(400).send({ error: "No recipe text or file provided." });
              }
      
              // Store in MongoDB
              const recipe = {
                  ...recipeData,
                  created_at: new Date()
              };
              const recipeResult = await recipeCollection.insertOne(recipe);
      
              // Store ingredients separately if present
              if (recipeData.ingredients) {
                  await recipeIngredientsCollection.insertOne({
                      recipe_id: recipeResult.insertedId,
                      ...recipeData.ingredients
                  });
              }
      
              // Append to text file with delimiter
              const formattedRecipe = JSON.stringify(recipeData, null, 2);
              await fs.appendFile("my_fav_recipes.txt", 
                  `---RECIPE_START---\n${formattedRecipe}\n---RECIPE_END---\n`);
      
              res.status(201).send({ 
                  message: "Recipe added successfully", 
                  recipe_id: recipeResult.insertedId,
                  recipe: recipeData 
              });
          } catch (error) {
              console.error("Error adding recipe:", error);
              res.status(500).send({ error: "Failed to add recipe." });
          }
      });
        
        // API: Retrieve All Favorite Recipes
        app.get("/recipes", async (req, res) => {
          try {
              // Get recipes from MongoDB instead of file
              const recipes = await recipeCollection.find().toArray();
              
              // Enrich with ingredients
              const enrichedRecipes = await Promise.all(recipes.map(async (recipe) => {
                  const ingredients = await recipeIngredientsCollection
                      .find({ recipe_id: recipe._id })
                      .toArray();
                  return { ...recipe, ingredients };
              }));
      
              res.status(200).send(enrichedRecipes);
          } catch (error) {
              console.error("Error retrieving recipes:", error);
              res.status(500).send({ error: "Failed to retrieve recipes." });
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


