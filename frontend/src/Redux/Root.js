import { combineReducers } from "redux";
import { Role_Reducer,search_bar_reducer,show_search_reducer } from "./Reducer";

const Root = combineReducers({
    Role_Reducer,search_bar_reducer,show_search_reducer
  });
  
export { Root };