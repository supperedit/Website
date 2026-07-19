const fs = require('fs');
const path = require('path');

// Example: Fetch recipes from Notion and write to src/data/recipes.json
async function syncRecipes() {
  try {
    // TODO: Add your Notion API integration here
    // For now, this is a placeholder
    const recipes = {
      recipes: []
    };

    // Ensure directory exists
    const dir = path.dirname('src/data/recipes.json');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write the recipes file
    fs.writeFileSync('src/data/recipes.json', JSON.stringify(recipes, null, 2));
    console.log('Recipes synced successfully');
  } catch (error) {
    console.error('Failed to sync recipes:', error);
    process.exit(1);
  }
}

syncRecipes();
