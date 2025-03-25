const API_KEY = '0952e50d31184aba875551c97f6359fe'; // Replace with your API key

// Search for recipes
async function searchRecipes() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) {
        alert('Please enter a search term');
        return;
    }

    const resultsDiv = document.getElementById('results');
    const loadingDiv = document.getElementById('loading');
    
    // Show loading spinner
    loadingDiv.style.display = 'block';
    resultsDiv.innerHTML = '';
    
    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=6&apiKey=${API_KEY}`);
        const data = await response.json();
        
        displayResults(data.results);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        resultsDiv.innerHTML = '<p class="text-danger">Error loading recipes. Please try again.</p>';
    } finally {
        loadingDiv.style.display = 'none';
    }
}

// Display search results
function displayResults(recipes) {
    const resultsDiv = document.getElementById('results');
    
    if (recipes.length === 0) {
        resultsDiv.innerHTML = '<p class="text-center">No recipes found. Try a different search term.</p>';
        return;
    }
    
    recipes.forEach(recipe => {
        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = `
            <div class="card recipe-card">
                <img src="${recipe.image}" class="card-img-top" alt="${recipe.title}">
                <div class="card-body">
                    <h5 class="card-title">${recipe.title}</h5>
                    <div class="d-flex justify-content-between align-items-center">
                        <button onclick="viewRecipe(${recipe.id})" class="btn btn-sm btn-outline-primary">View Recipe</button>
                    </div>
                </div>
            </div>
        `;
        resultsDiv.appendChild(col);
    });
}

// Redirect to recipe details page
function viewRecipe(id) {
    window.location.href = `recipe.html?id=${id}`;
}

// Load and display recipe details
async function loadRecipeDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');
    
    if (!recipeId) return;
    
    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`);
        const data = await response.json();
        
        displayRecipeDetails(data);
    } catch (error) {
        console.error('Error fetching recipe details:', error);
        document.getElementById('recipeDetails').innerHTML = `
            <div class="alert alert-danger">Error loading recipe details. Please try again.</div>
        `;
    }
}

// Display full recipe details
function displayRecipeDetails(recipe) {
    const detailsDiv = document.getElementById('recipeDetails');
    
    // Format instructions (remove HTML tags if present)
    let instructions = recipe.instructions || "No instructions available";
    instructions = instructions.replace(/<[^>]*>?/gm, '');
    
    // Format ingredients
    let ingredientsList = '';
    if (recipe.extendedIngredients) {
        ingredientsList = recipe.extendedIngredients.map(ing => 
            `<li class="ingredient-item">${ing.original}</li>`
        ).join('');
    }
    
    detailsDiv.innerHTML = `
        <div class="recipe-header">
            <img src="${recipe.image}" class="recipe-image" alt="${recipe.title}">
            <div class="p-4">
                <h1 class="recipe-title">${recipe.title}</h1>
                <div class="recipe-meta">
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${recipe.readyInMinutes} mins</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-utensils"></i>
                        <span>${recipe.servings} servings</span>
                    </div>
                </div>
                <div class="mt-3">${recipe.summary.replace(/<[^>]*>?/gm, '')}</div>
            </div>
        </div>

        <div class="row mt-4">
            <div class="col-md-6">
                <div class="ingredients-card">
                    <h3 class="card-title"><i class="fas fa-list-ul me-2"></i>Ingredients</h3>
                    <ul class="list-unstyled">
                        ${ingredientsList || '<li>No ingredients information available</li>'}
                    </ul>
                </div>
            </div>
            <div class="col-md-6">
                <div class="nutrition-facts">
                    <h3 class="card-title"><i class="fas fa-chart-pie me-2"></i>Nutrition Facts</h3>
                    ${recipe.nutrition ? formatNutrition(recipe.nutrition) : '<p>No nutrition information available</p>'}
                </div>
            </div>
        </div>

        <div class="instructions-card mt-4">
            <h3 class="card-title"><i class="fas fa-list-ol me-2"></i>Instructions</h3>
            <ol class="list-unstyled">
                ${formatInstructions(instructions)}
            </ol>
        </div>
    `;
}

// Format nutrition information
function formatNutrition(nutrition) {
    if (!nutrition.nutrients) return '<p>No nutrition data available</p>';
    
    return nutrition.nutrients
        .filter(n => ['Calories', 'Protein', 'Carbohydrates', 'Fat', 'Fiber'].includes(n.name))
        .map(n => `
            <div class="nutrition-item">
                <span>${n.name}</span>
                <span>${Math.round(n.amount)}${n.unit}</span>
            </div>
        `).join('');
}

// Format instructions into steps
function formatInstructions(instructions) {
    // Split by numbered steps or paragraphs
    const steps = instructions.split(/\d+\.|\n\n/).filter(step => step.trim());
    
    return steps.map((step, index) => `
        <li class="instruction-step">${step.trim()}</li>
    `).join('');
}

// Initialize appropriate function based on current page
if (window.location.pathname.includes("recipe.html")) {
    document.addEventListener('DOMContentLoaded', loadRecipeDetails);
}
