import { combineReducers } from "redux";
import user from './user';
import display from './display';


export default combineReducers({
    user,
    display
});
