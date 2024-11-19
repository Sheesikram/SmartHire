
const Role_Reducer = (state = "Candidate", action) => {
    if (action.type === "Role") {
      return action.payload;
    }
    return state;
  };


  const search_bar_reducer = (state = "", action) => {
    if (action.type === "search_bar") {
      return action.payload;
    }
    return state;
  };

  const show_search_reducer = (state = true ,action) => {
    if (action.type === "show_search") {
      return action.payload;
    }
    return state;
  };

export {Role_Reducer,search_bar_reducer,show_search_reducer}