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

export const setSelectedNamespace = (namespace) => ({
  type: TYPE.SET_SELECTED_NAMESPACE,
  payload: namespace,
});

/*
export const showConnections = () => ({
  type: TYPE.SHOW_CONNECTIONS,
});

export const hideConnections = () => ({
  type: TYPE.HIDE_CONNECTIONS,
});
*/