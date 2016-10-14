redux-model-util
----------------

Most web applications have models (or REST documents if you prefer) to fetch and perform actions on.  This project provides a suite of action creators, reducer functions, model data wrappers (your redux state data is still just a plain old object) and a React component wrapper to auto-fetch your model data and provide consistency in your application code.

Middleware requirements
- [redux-effects-fetch](https://github.com/redux-effects/redux-effects-fetch): XHR fetch actions are handled using this
- [redux-multi](https://github.com/ashaffer/redux-multi): actions to be dispatched can be arrays

The idea is to put some structure around common redux needs
- there is a common pattern seen in web apps in the fact that data needs to be fetched asynchronously
- redux state needs to represent data fetching/fetched state if the UI should show that state
- action types need to match up with reducer expectations
- model data needs to match a location that the components are looking for them in `mapStateToProps`
- smart component would (usually) want to fetch the model data if it isn’t present

## Installation
```
npm install --save redux-model-util redux-effects redux-effects-fetch redux-multi
```
And apply the middleware dependencies
```
import effects from 'redux-effects';
import fetch from 'redux-effects-fetch';
import multi from 'redux-multi';

applyMiddleware(multi, effects, fetch);
```

## Usage

### Reducer
```javascript
import { modelReducer } from 'redux-model-util';

// "CUSTOMER" is the example action prefix that would match what is provided to the action creator
const customerModelReducer = modelReducer('CUSTOMER');

// in this example, this reducer would be included using redux combineReducers with the `customers` attribute
export default function (state = {}, action) {

  const newState = customerModelReducer(state, action);
  if (newState !== state) {
    return newState;
  }

  // add your own reducer logic here or, if you have no additional action types to work with
  // export default customerModelReducer;
}
```

### Action Creator
```javascript
import { actionCreator } from 'redux-model-util';
const customerActionCreator = actionCreator('CUSTOMER');

// return a redux action that will fetch and store the customer data for the provided id
// the use of `redux-effects`, `redux-effects-fetch` and `redux-multi` is required
// dispatched event types are `CUSTOMER_FETCH_PENDING`, `CUSTOMER_FETCH_SUCCESS`, `CUSTOMER_FETCH_ERROR`
export function fetch (id) {
  return customerActionCreator.createFetchAction({
    url: `/path/to/customer/endpoint/${id}`
  });
}
```

### React Component
```javascript
import { componentUtil } from 'redux-model-util';
import { connect } from 'react-redux';
// your dumb component
import MyCustomerDumbComponent from '...';
// your action creator (refer to the "Action Creator" example)
import myCustomerActionCreator from '...';

// redux mapStateToProps smart component function
function mapStateToProps (state) {
  return {
    // `customers` should match the state for the model reducer (refer to "Reducer" example)
    customers: state.customers
  }
}

// redux mapDispatchToProps smart component function
function mapDispatchToProps (dispatch) {
  return {
    fetch: id => dispatch(myCustomerActionCreator.fetch(id))
  };
}

// smart components are connected to redux state
// think of this example as a smart component that ensures the model data is fetched and the model is provided as a prop value
export default connect(mapStateToProps, mapDispatchToProps)(
  componentUtil.modelFetcher(MyCustomerDumbComponent, {
    id: 'params.id', // the property path to find the model id (this example would get the id from props.params.id)
    models: 'customers', // should match the property passed with `mapStateToProps` representing the models domain object
  });
);

// an additional `id` and `model` property will be provided to your dumb component
// the id in this case would be the value from `props.params.id`
// the model object would contain the following attributes
// - fetched: function returning the model data if it has been fetched
// - isFetchPending: function return true if an XHR fetch is currently in progress
// - fetchError: function returning the error if a fetch resulted in an error
//
// ... and other functions dealing with additional actions that can be executed on a model
```