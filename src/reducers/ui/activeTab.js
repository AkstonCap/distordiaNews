import * as TYPE from 'actions/types';

const initialState = 'Catalogue'; // Set your default tab here

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SWITCH_TAB:
      return action.payload;
    default:
      return state;
  }
};