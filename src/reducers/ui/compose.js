import * as TYPE from 'actions/types';

const initialState = {
  replyTo: null,
  quote: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.SET_REPLY_TO:
      return {
        ...state,
        replyTo: action.payload,
        quote: null,
      };
    case TYPE.SET_QUOTE:
      return {
        ...state,
        quote: action.payload,
        replyTo: null,
      };
    case TYPE.CLEAR_COMPOSE_CONTEXT:
      return {
        ...state,
        replyTo: null,
        quote: null,
      };
    default:
      return state;
  }
};
