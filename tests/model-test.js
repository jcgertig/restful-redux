/* global it, describe */

import Model from '../src/model';
import { schema, denormalize } from 'normalizr';
var expect = require('chai').expect;

var personSchema = new schema.Entity('people');
var fooSchema = new schema.Entity('foo');
fooSchema.define({
  author: personSchema
});

var nullEntities = undefined;

var noMetaEntities = {
  foo: {
    '1': {
      foo: 'bar'
    }
  }
};

var metaEntities = {
  _meta: {
    foo: {
      '1': {
        data: {
          abc: 'def'
        }
      }
    }
  },
  foo: {
    '1': {
      foo: 'bar'
    }
  }
};

var normalizedEntities = {
  _meta: {},
  people: {
    '1': {
      id: '1',
      firstName: 'Joe',
      lastName: 'Hudson'
    }
  },
  foo: {
    '1': {
      id: '1',
      foo: 'bar',
      author: '1'
    }
  }
};

function options (entitiesOrMeta, isEntities, options) {
  var entities = isEntities ? entitiesOrMeta : copyMetaEntities(entitiesOrMeta);
  return Object.assign({
    id: '1',
    entityType: 'foo',
    entities: entities
  }, options);
}

function copyMetaEntities(meta) {
  var entities = JSON.parse(JSON.stringify(metaEntities));
  Object.assign(entities._meta.foo['1'], meta);
  return entities;
}

describe('model', function () {
  describe('fromCache', function () {
    it('should return a new model if cache is empty and entities are empty', function () {
      var model = Model.fromCache({ id: '1', entityType: 'foo' }, {});
      expect(model.value()).to.equal(undefined);
      expect(model.data()).to.deep.equal({});
    });

    it('should return the same model if cache is empty and entities are empty', function () {
      var cache = {};
      var model1 = Model.fromCache({ id: '1', entityType: 'foo' }, cache);
      var model2 = Model.fromCache({ id: '1', entityType: 'foo' }, cache);
      expect(model1).to.equal(model2);
    });

    it('should return the same model if cache is empty and entities are populated', function () {
      var state = {
        entities: {
          _meta: {
            foo: {
              '1': {
                data: {
                  ghi: 'jkl'
                }
              }
            }
          },
          foo: {
            '1': {
              abc: 'def'
            }
          }
        }
      };
      var cache = {};
      var model1 = Model.fromCache({ id: '1', entityType: 'foo', entities: state }, cache);
      expect(model1.value()).to.deep.equal({ abc: 'def' });
      expect(model1.data()).to.deep.equal({ ghi: 'jkl' });
      var model2 = Model.fromCache({ id: '1', entityType: 'foo', entities: state }, cache);
      expect(model1).to.equal(model2);
    });

    it('should return a new model if the model value changes', function () {
      var value = {
        data: {
          ghi: 'jfk'
        }
      };
      var meta = {
        abc: 'def'
      };
      var state = {
        entities: {
          _meta: {
            foo: {
              '1': meta
            }
          },
          foo: {
            '1': value
          }
        }
      };
      var newState = {
        entities: {
          _meta: {
            foo: {
              '1': meta
            }
          },
          foo: {
            '1': value
          }
        }
      };
      var cache = {};
      var model1 = Model.fromCache({ id: '1', entityType: 'foo', entities: state }, cache);
      var model2 = Model.fromCache({ id: '1', entityType: 'foo', entities: newState }, cache);
      expect(model1 === model2).to.equal(true);

      cache = {};
      newState = {
        entities: {
          _meta: {
            foo: {
              '1': Object.assign({}, meta)
            }
          },
          foo: {
            '1': value
          }
        }
      };
      model1 = Model.fromCache({ id: '1', entityType: 'foo', entities: state }, cache);
      model2 = Model.fromCache({ id: '1', entityType: 'foo', entities: newState }, cache);
      expect(model1 === model2).to.equal(false);

      newState = {
        entities: {
          _meta: {
            foo: {
              '1': meta
            }
          },
          foo: {
            '1': Object.assign({}, value)
          }
        }
      };
      cache = {};
      model1 = Model.fromCache({ id: '1', entityType: 'foo', entities: state }, cache);
      model2 = Model.fromCache({ id: '1', entityType: 'foo', entities: newState }, cache);
      expect(model1 === model2).to.equal(false);
    });
  });

  it('should denormalize the value', function () {
    var model = new Model(options(normalizedEntities, true, {
      schema: fooSchema,
      denormalize
    }));
    expect(model.value()).to.deep.eql({
      id: '1',
      foo: 'bar',
      author: {
        id: '1',
        firstName: 'Joe',
        lastName: 'Hudson'
      }
    });
  });

  it('should return meta data', function () {
    var model = new Model(options(metaEntities, true));
    expect(model.data()).to.deep.eql({
      abc: 'def'
    });
  });

  describe('value', function () {
    it('should return with a provided domain and id', function () {
      var model = new Model(options(noMetaEntities, true));
      expect(model.value()).to.deep.equal({foo: 'bar'});
    });

    it('should not fail if no domain exists', function () {
      var model = new Model(options(nullEntities, true));
      expect(model.value()).to.deep.equal(undefined);
    });
  });


  describe('alternative constructors', function () {
    it('(id, value, meta)', function () {
      var model = new Model('1', { foo: 'bar' }, { data: { abc: 'def' }, fetch: { success: true }, action: { id: 'test', error: { ghi: 'jkl' } } });
      expect(model.value()).to.deep.eql({ foo: 'bar' });
      expect(model.data()).to.deep.eql({ abc: 'def' });
      expect(model.wasFetched()).to.equal(true);
      expect(model.wasActionPerformed('test')).to.deep.equal({ id: 'test', error: { ghi: 'jkl' } });
    });
    it('(ivalue, meta)', function () {
      var model = new Model({ id: '1', foo: 'bar' }, { data: { abc: 'def' }, fetch: { success: true }, action: { id: 'test', error: { ghi: 'jkl' } } });
      expect(model.value()).to.deep.eql({ id: '1', foo: 'bar' });
      expect(model.data()).to.deep.eql({ abc: 'def' });
      expect(model.wasFetched()).to.equal(true);
      expect(model.wasActionPerformed('test')).to.deep.equal({ id: 'test', error: { ghi: 'jkl' } });
    });
  });


  describe('wasFetched', function () {
    it('should return "exists" if the model exists with no meta value', function () {
      var model = new Model(options(noMetaEntities, true));
      expect(model.wasFetched()).to.deep.equal('exists');
    });

    it('should return the meta "fetched" if exists', function () {
      var model = new Model(options({ fetch: { success: 'fetched' } }));
      expect(model.wasFetched()).to.equal('fetched');
    });

    it('Model.wasFetched', function () {
      expect(Model.wasFetched({ fetch: { success: 'fetched' } })).to.equal('fetched');
    });
  });


  describe('isFetchPending', function () {
    it('should return "initiatedAt" timestamp (or true) if a fetch is pending', function () {
      var model = new Model(options({ fetch: { pending: true, initiatedAt: 12345 } }));
      expect(model.isFetchPending()).to.equal(12345);
    });

    it('should return false if a fetch is not pending', function () {
      var model = new Model(options({ }));
      expect(model.isFetchPending()).to.equal(false);
    });

    it('should not fail if no model is provided', function () {
      var model = new Model(options({ }, true));
      expect(model.isFetchPending()).to.equal(false);
    });

    it('Model.isFetchPending', function () {
      expect(Model.isFetchPending({ })).to.equal(false);
    });
  });


  describe('timeSinceFetch', function () {
    it('should return a number if the model has been fetched', function () {
      var model = new Model(options({ fetch: { completedAt: 12345 } }));
      var value = model.timeSinceFetch();
      expect(typeof value).to.equal('number');
      expect(value > 0).to.equal(true);
    });
    it('should return -1 if the model has not been fetched', function () {
      var model = new Model(options({ }));
      expect(model.timeSinceFetch()).to.equal(-1);
    });
    it('should use the explicitely provided time if included', function () {
      var model = new Model(options({ fetch: { completedAt: 12345 } }));
      expect(model.timeSinceFetch(12346)).to.equal(1);
    });
    it('Model.timeSinceFetch', function () {
      expect(Model.timeSinceFetch({ fetch: { completedAt: 12345 } }, 12346)).to.equal(1);
    });
  });


  describe('fetchError', function () {
    it('should return the fetch error', function () {
      var model = new Model(options({ fetch: { error: {foo: 'bar'} } }));
      expect(model.fetchError()).to.deep.equal({foo: 'bar'});
    });

    it('should return undefined if no model exists', function () {
      var model = new Model(options({ }, true));
      expect(model.fetchError()).to.equal(undefined);
    });

    it('Model.fetchError', function () {
      expect(Model.fetchError({ fetch: { error: {foo: 'bar'} } })).to.deep.equal({foo: 'bar'});
    });
  });


  describe('isActionPending', function () {
    it('should return the action id if any action is pending', function () {
      var model = new Model(options({ action: { id: 'foo', pending: true, initiatedAt: 12345 } }));
      expect(model.isActionPending()).to.deep.equal({ id: 'foo', pending: true, initiatedAt: 12345 });
    });

    it('should return true if a specific action is pending', function () {
      var model = new Model(options({ action: { id: 'foo', pending: true, initiatedAt: 12345 } }));
      expect(model.isActionPending()).to.deep.equal({ id: 'foo', pending: true, initiatedAt: 12345 });
    });

    it('should return false if a different action is pending', function () {
      var model = new Model(options({ action: { id: 'foo', pending: true, initiatedAt: 12345 } }));
      expect(model.isActionPending('bar')).to.equal(false);
    });

    it('should return false if an action is not pending', function () {
      var model = new Model(options({ }));
      expect(model.isActionPending()).to.equal(false);
    });

    it('should not fail if no model is provided', function () {
      var model = new Model(options({ }, true));
      expect(model.isActionPending()).to.equal(false);
    });

    it('Model.isActionPending', function () {
      expect(Model.isActionPending({ action: { id: 'foo', pending: true, initiatedAt: 12345 } }, 'foo')).to.deep.equal({ id: 'foo', pending: true, initiatedAt: 12345 });
    });
  });


  describe('wasActionPerformed', function () {
    it('should return the action details if any action was performed', function () {
      var model = new Model(options({ action: { id: 'foo', success: { foo: 'bar'}, completedAt: 12345 } }));
      expect(model.wasActionPerformed()).to.deep.equal({ id: 'foo', success: { foo: 'bar'}, completedAt: 12345 });
    });

    it('should return action details if a specific action was performed', function () {
      var model = new Model(options({ action: { id: 'foo', success: { foo: 'bar'}, completedAt: 12345 } }));
      expect(model.wasActionPerformed('foo')).to.deep.equal({ id: 'foo', success: { foo: 'bar'}, completedAt: 12345 });
    });

    it('should return action error details if an action failed', function () {
      var model = new Model(options({ action: { id: 'foo', error: { foo: 'bar'}, completedAt: 12345 } }));
      expect(model.wasActionPerformed('foo')).to.deep.equal({ id: 'foo', error: { foo: 'bar'}, completedAt: 12345 });
    });

    it('should return false if a different action was performed', function () {
      var model = new Model(options({ id: 'foo', error: { foo: 'bar'}, completedAt: 12345 }));
      expect(model.wasActionPerformed('bar')).to.equal(false);
    });

    it('should return false if an action was not performed', function () {
      var model = new Model(options({ }));
      expect(model.wasActionPerformed()).to.equal(false);
    });

    it('Model.wasActionPerformed', function () {
      expect(Model.wasActionPerformed({ action: { id: 'foo', success: { foo: 'bar'}, completedAt: 12345 } }, 'foo')).to.deep.equal({ id: 'foo', success: { foo: 'bar'}, completedAt: 12345 });
    });
  });

});
