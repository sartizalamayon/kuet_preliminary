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
