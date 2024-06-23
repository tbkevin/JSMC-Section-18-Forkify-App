// import icons from '../img/icons.svg';
import * as model from './model.js'
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultView from './views/resultView.js';
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';
// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function () {
  try {

    const id = window.location.hash.slice(1);
    console.log(id);

    if (!id) return;

    recipeView.renderSpinner();

    //0) Update results view to mark selected search result
    resultView.update(model.getSearchResultsPage());

    //1)Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // 2)  Loading recipe
    await model.loadRecipe(id);

    console.log("-----")
    // 3)  Render recipe
    recipeView.render(model.state.recipe);

  } catch (error) {
    recipeView.renderError();
    console.error(error);
  }


};

const controlSearchResults = async function () {
  try {
    resultView.renderSpinner();
    //1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    //2) Load search results
    await model.loadSearchResults(query);

    //3) Render results
    resultView.render(model.getSearchResultsPage());

    //4) Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (error) {
    console.error(error);
  }
}

const controlPagination = function (goToPage) {
  console.log(goToPage);
  //1) Render new results
  resultView.render(model.getSearchResultsPage(goToPage));

  //2) Render new pagination buttons
  paginationView.render(model.state.search);
}

const controlServings = function (newServings) {
  //Update the recipe servings(in state)
  model.updateServings(newServings);
  //Update the recipe view 
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);

}

const controlAddBookMark = function () {
  // 1)Add o remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookMark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  // 2) Update recipe view
  recipeView.update(model.state.recipe);
  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
}


const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
}

const controlAddRecipe =async function (newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();
    //Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    
    // Render recipe
    recipeView.render(model.state.recipe);
    
    //Succes Message
    addRecipeView.renderMessage();

    //Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change ID on the url
    //IMPallow us to change the url without reloading the pageIMP
    window.history.pushState(null,'',`#${model.state.recipe.id}`);

    //Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    },MODAL_CLOSE_SEC * 1000)
  } catch (error) {
    console.error('💨💨💨💨 ',error);
    addRecipeView.renderError(error.message);
  }
}

//  NT Listening for load and hasChange events NT
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHanderRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookMark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerclick(controlPagination);
  addRecipeView.addHanlerUpload(controlAddRecipe);

};

init();
