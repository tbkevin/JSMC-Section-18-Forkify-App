import { API_URL, KEY, RES_PER_PAGE } from "./config.js";
import { AJAX} from "./helpers.js";
export const state = {
    recipe: {},
    search: {
        query: '',
        page: 1,
        results: [],
        resultsPerPage: RES_PER_PAGE
    },
    bookmarks: [],
};


const createRecipeObject = function (data) {
    const { recipe } = data.data;
    return  {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        sourceUrl: recipe.source_url,
        image: recipe.image_url,
        serving: recipe.servings,
        cookingTime: recipe.cooking_time,
        ingredients: recipe.ingredients,
        ...(recipe.key && {key:recipe.key})
    };

}

//IMPEsta funcion no deveolvera nada, solo modificara el estado de la aplicacion, el "recipe"IMP
export const loadRecipe = async function (id) {
    try {
        const data = await AJAX(`${API_URL}${id}?key=${KEY}`);

        state.recipe  = createRecipeObject(data);

        if (state.bookmarks.some(bookmark => bookmark.id === id)) {
            state.recipe.bookmarked = true;
        } else {
            state.recipe.bookmarked = false;
        }
        console.log(state.recipe);
    } catch (error) {
        // Temp error handling
        console.error(`${error} 🚗🚗🚗`);
        throw error;
    }
}

export const loadSearchResults = async function (query) {
    try {
        const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
        console.log(data);

        state.search.query = query
        state.search.results = data.data.recipes.map(rec => {
            return {
                id: rec.id,
                title: rec.title,
                publisher: rec.publisher,
                image: rec.image_url,
                ...(rec.key && {key:rec.key})

            }
        });
        state.search.page = 1;

    } catch (error) {
        console.error(`${error} 🚗🚗🚗`);
        throw error;
    }
};


export const getSearchResultsPage = function (page = state.search.page) {
    state.search.page = page;
    const start = (page - 1) * state.search.resultsPerPage;
    const end = page * state.search.resultsPerPage;
    return state.search.results.slice(start, end)
};

export const updateServings = function (newServings) {
    console.log("ff");
    state.recipe.ingredients.forEach(ingredient => {
        ingredient.quantity = (ingredient.quantity * newServings) / state.recipe.serving;
        //newQt = oldQt * newServings / oldServings
    });
    state.recipe.serving = newServings;
};

const persistBookMarks = function () {
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
}

export const addBookMark = function (recipe) {
    // Add bookmark
    state.bookmarks.push(recipe);
    // Mark current recipe as bookmark
    if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

    persistBookMarks();
};

export const deleteBookmark = function (id) {
    const index = state.bookmarks.findIndex(bookmark => bookmark.id === id);
    state.bookmarks.splice(index, 1);
    if (id === state.recipe.id) state.recipe.bookmarked = false;

    persistBookMarks();
};

const init = function () {
    const storage = localStorage.getItem('bookmarks');
    if (storage) state.bookmarks = JSON.parse(storage);
};

init();


const clearBookmarks = function () {
    localStorage.clear('bookmarks');
};

export const uploadRecipe = async function (newRecipe) {
    //console.log(newRecipe);
    try {
        const ingredients = Object.entries(newRecipe).filter(entry => entry[0].startsWith('ingredient')
            && entry[1] !== '').map(ing => {
                const ingArr = ing[1].replaceAll(' ', '').split(',');
                if (ingArr.length !== 3) throw new Error('Wrong ingredient format! Please use the correct format :D')
                const [quantity, unit, description] = ingArr;
                return { quantity: quantity ? +quantity : null, unit, description }
            });
        const recipe = {
            title: newRecipe.title,
            source_url:newRecipe.sourceUrl,
            image_url:newRecipe.image,
            publisher:newRecipe.publisher,
            cooking_time: +newRecipe.cookingTime,
            servings:+newRecipe.servings,
            ingredients
        }
        const data = await AJAX(`${API_URL}?key=${KEY}`,recipe);
        state.recipe = createRecipeObject(data);
        addBookMark(state.recipe);
        console.log(state.recipe);
    } catch (error) {
        throw error;
    }

}
