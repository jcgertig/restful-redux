Model Reducer
---------------
An automated reducer which understands dispatched actions created by the [action creators](./action creator);

This can either be used as a standalone reducer
```
import { reducer } from 'react-redux-model';

// simple example demonstrating a reducer dealing with "customer" data
export default reducer({
  // should match the action creator `actionPrefix` option
  actionPrefix: 'CUSTOMER',
  // should match the action creator `entityType` option
  entityType: 'customer'
});
```
And that's it!  Or you can compose several of these reducers into a single one using the `join` function
```
// customer model data
const customerReducer = reducer({
  actionPrefix: 'CUSTOMER',
  entityType: 'customer'
});
// customer search collections
const customerSearchReducer = reducer({
  actionPrefix: 'CUSTOMER_SEARCH',
  entityType: 'customerSearch'
});

export default function (state = {}, action) {
  const newState = reducer.join([customerReducer, customerSearchReducer]);
  if (newState !== state) {
    return newState;
  }

  // you can add your own customer reducer logic as well
}
```


### options
* ***actionPrefix***: required identifier for all actions which must match the `actionPrefix` config option in the associated action creator
* ***entityType***: required identifier (used for root state key of domain specific models) which must match the `entityType` config option in the associated action creator
* ***
