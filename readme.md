# Database Schema

## **1. UserIngredients Table**
Stores the ingredients available at the user’s home.

| **Column Name**   | **Data Type**   | **Constraints**                  | **Description**                              |
|--------------------|-----------------|----------------------------------|----------------------------------------------|
| `ingredient_id`    | INT             | PRIMARY KEY, AUTO_INCREMENT      | Unique identifier for each ingredient.       |
| `name`             | VARCHAR(100)   | NOT NULL                         | Name of the ingredient (e.g., sugar, flour). |
| `quantity`         | FLOAT           | DEFAULT 0                        | Quantity available (e.g., 1.5 kg, 3 pcs).    |
| `unit`             | VARCHAR(20)    |                                  | Unit of measurement (e.g., kg, pcs, tbsp).   |
| `last_updated`     | TIMESTAMP       | DEFAULT CURRENT_TIMESTAMP        | Tracks when the ingredient was last updated. |

---

## **2. Recipe Table**
Stores details about recipes.

| **Column Name**   | **Data Type**   | **Constraints**                  | **Description**                              |
|--------------------|-----------------|----------------------------------|----------------------------------------------|
| `recipe_id`        | INT             | PRIMARY KEY, AUTO_INCREMENT      | Unique identifier for each recipe.           |
| `name`             | VARCHAR(200)   | NOT NULL                         | Name of the recipe.                          |
| `description`      | TEXT            |                                  | A short description of the recipe.           |
| `taste`            | VARCHAR(50)    |                                  | Taste profile (e.g., sweet, spicy).          |
| `cuisine`          | VARCHAR(50)    |                                  | Cuisine type (e.g., Italian, Bengali).       |
| `prep_time`        | INT             |                                  | Preparation time in minutes.                 |
| `steps`            | TEXT            |                                  | Steps to prepare the recipe.                 |

---

## **3. RecipeIngredients Table**
Establishes a many-to-many relationship between recipes and ingredients.

| **Column Name**       | **Data Type**   | **Constraints**                  | **Description**                              |
|------------------------|-----------------|----------------------------------|----------------------------------------------|
| `recipe_id`            | INT             | FOREIGN KEY (Recipes)            | ID of the recipe.                            |
| `ingredient_id`        | INT             | FOREIGN KEY (Ingredients)        | ID of the ingredient.                        |
| `quantity_required`    | FLOAT           | NOT NULL                         | Quantity required for the recipe.            |
| `unit`                 | VARCHAR(20)    |                                  | Unit of measurement (e.g., kg, pcs, tbsp).   |




# API Documentation

## Ingredients Management

### Add a New Ingredient
- **Route:** `/ingredients`
- **Method:** POST
- **Sample Payload:**
```json
{
  "name": "Sugar",
  "quantity": 2,
  "unit": "kg"
}
```
- **Sample Response:**
```json
{
  "message": "Ingredient added",
  "id": "648df63f93a2f234e4567890"
}
```

### Retrieve All Ingredients
- **Route:** `/ingredients`
- **Method:** GET
- **Sample Response:**
```json
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
```

### Update an Ingredient
- **Route:** `/ingredients/:id`
- **Method:** PUT
- **Sample Payload:**
```json
{
  "quantity": 3,
  "unit": "kg"
}
```
- **Sample Response:**
```json
{
  "message": "Ingredient updated"
}
```

## Recipe Management

### Add a New Recipe
- **Route:** `/recipes`
- **Method:** POST
- **Content Type:** multipart/form-data
- **Sample Payload:**
```json
{
    "file": "recipe-image.jpg",  // Optional
    "recipeText": "Recipe description..."  // Optional
}
```
- **Sample Response:**
```json
{
    "message": "Recipe added successfully",
    "recipe_id": "648df63f93a2f234e4567890",
    "recipe": {
        "name": "Recipe Name",
        "description": "Recipe Description",
        "taste": "Sweet",
        "cuisine": "Italian",
        "prep_time": 30,
        "steps": "Step 1...",
        "ingredients": {
            "name": "Ingredient",
            "quantity_required": 2,
            "unit": "cups"
        }
    }
}
```

### Retrieve All Recipes
- **Route:** `/recipes`
- **Method:** GET
- **Sample Response:**
```json
[
    {
        "_id": "648df63f93a2f234e4567890",
        "name": "Recipe Name",
        "description": "Recipe Description",
        "ingredients": [
            {
                "name": "Ingredient",
                "quantity_required": 2,
                "unit": "cups"
            }
        ]
    }
]
```

### Download Recipes Text File
- **Route:** `/recipes/download`
- **Method:** GET
- **Response:** Text file (my_fav_recipes.txt)

## Recipe Suggestions

### Get Recipe Suggestions
- **Route:** `/chat/recipe-suggestion`
- **Method:** POST
- **Sample Payload:**
```json
{
    "message": "I want something sweet today"
}
```
- **Sample Response:**
```json
{
    "suggestion": "Based on your available ingredients..."
}
```