import { combineReducers } from 'redux';

import inputValue from './inputValue';
import activeTab from './activeTab';
import compose from './compose';

const combined = combineReducers({
  inputValue,
  activeTab,
  compose,
});

// Flatten compose state to top level of ui for simpler access
export default (state, action) => {
  const next = combined(state, action);
  return {
    ...next,
    replyTo: next.compose?.replyTo || null,
    quote: next.compose?.quote || null,
  };
};
