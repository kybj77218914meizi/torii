import { inject as service } from '@ember/service';
import Component from '@ember/component';
import Controller from '@ember/controller';
import { run } from '@ember/runloop';
import startApp from '../helpers/start-app';
import configuration from '../../config/environment';
import lookup from '../helpers/lookup';
import { module, test } from 'qunit';

function lookupFactory(app, key) {
  if (app.__container__.factoryFor) {
    return app.__container__.factoryFor(key);
  } else {
    return app.__container__.lookupFactory(key);
  }
}

let toriiConfiguration = configuration.torii;
var originalSessionServiceName;

module('Acceptance | Ember Initialization', {
  beforeEach() {
    originalSessionServiceName = toriiConfiguration.sessionServiceName;
    delete toriiConfiguration.sessionServiceName;
  },

  afterEach() {
    toriiConfiguration.sessionServiceName = originalSessionServiceName;
    run(this.application, 'destroy');
  }
});

test('session is not injected by default', function(assert){
  this.application = startApp();
  assert.ok(!lookup(this.application, 'service:session'));

  this.application.register('controller:application', Controller.extend());
  var controller = lookup(this.application, 'controller:application');
  assert.ok(!controller.get('session'), 'controller has no session');
});

test('session is injected with the name in the configuration', function(assert){
  toriiConfiguration.sessionServiceName = 'wackySessionName';

  this.application = startApp();
  assert.ok(lookup(this.application, 'service:wackySessionName'), 'service:wackySessionName is injected');

  this.application.register('controller:application', Controller.extend());
  var controller = lookup(this.application, 'controller:application');

  assert.ok(controller.get('wackySessionName'),
     'Controller has session with accurate name');

  assert.ok(!controller.get('session'),
     'Controller does not have "session" property name');
});

test('session is injectable using inject.service', function(assert){
  toriiConfiguration.sessionServiceName = 'session';

  this.application = startApp();
  assert.ok(lookup(this.application, 'service:session'), 'service:session is injected');

  this.application.register('component:testComponent', Component.extend({
    session: service('session'),
    torii: service('torii')
  }));

  var DummyRenderer = { componentInitAttrs() {} };

  var component = lookupFactory(this.application, 'component:testComponent').create({renderer: DummyRenderer});

  assert.ok(component.get('session'), 'Component has access to injected session service');
  assert.ok(component.get('torii'), 'Component has access to injected torii service');
});
