import { apiCall } from 'nexus-module';

// Action types
export const FETCH_ASSETS_REQUEST = 'FETCH_ASSETS_REQUEST';
export const FETCH_ASSETS_SUCCESS = 'FETCH_ASSETS_SUCCESS';
export const FETCH_ASSETS_FAILURE = 'FETCH_ASSETS_FAILURE';

// Thunk action creator to fetch assets from a specific namespace
export function fetchAssetsByNamespace(namespace) {
  return async (dispatch) => {
    dispatch({ type: FETCH_ASSETS_REQUEST, payload: namespace });
    try {
      // Use the correct Nexus API call pattern
      const response = await apiCall(
        'register/list/assets:asset/distordia-status,distordia-type,Text',
        { 
            //where: `results.name=${namespace}::* && results.distordia-type=post && results.distordia-status=official`,  
            // Add any other parameters you need here 
        }
      );
      dispatch({ type: FETCH_ASSETS_SUCCESS, payload: response });
    } catch (error) {
      dispatch({ type: FETCH_ASSETS_FAILURE, error });
    }
  };
}
