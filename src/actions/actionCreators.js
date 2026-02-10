import * as TYPE from './types';

export const switchTab = (tab) => ({
  type: TYPE.SWITCH_TAB,
  payload: tab,
});

export const updateInput = (inputValue) => ({
  type: TYPE.UPDATE_INPUT,
  payload: inputValue,
});

export const switchExtNamespace = (namespace) => ({
  type: TYPE.SWITCH_EXT_NAMESPACE,
  payload: namespace,
});

export const switchMyNamespace = (namespace) => ({
  type: TYPE.SWITCH_MY_NAMESPACE,
  payload: namespace,
});

export const setReplyTo = (post) => ({
  type: TYPE.SET_REPLY_TO,
  payload: post,
});

export const setQuote = (post) => ({
  type: TYPE.SET_QUOTE,
  payload: post,
});

export const clearComposeContext = () => ({
  type: TYPE.CLEAR_COMPOSE_CONTEXT,
});
