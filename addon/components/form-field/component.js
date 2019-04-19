import { computed, observer } from '@ember/object';
import Component from '@ember/component';
import { on } from '@ember/object/evented';
import * as yup from 'yup';
import RSVP from 'rsvp';

/**
 * This is the base component for form fields.
 */
export default Component.extend({
  dataSchema: null,
  value: '',
  enabled: false,

  errors: [],

  validate: observer('validation', 'enabled', function() {
    if (this.get('enabled')) {
      return this.get('validation').then((val) => {
        if (this.onInput) {
          this.onInput(val);
        }
        this.set('errors', []);
      }).catch((errors) => {
        this.set('errors', errors);
      });
    }
  }),

  form: null,
  name: null,

  registerFieldToForm: on('didInsertElement', function() {
    const form = this.get('form');
    const name = this.get('name');
    const isChildOfForm = Ember.isPresent(form) && Ember.isPresent(name);
    if (isChildOfForm) {
      form.fieldMap[name] = this;
    }
  }),

  unregisterFieldFromForm: on('willDestroyElement', function() {
    const form = this.get('form');
    const name = this.get('name');
    const isChildOfForm = Ember.isPresent(form) && Ember.isPresent(name);
    if (isChildOfForm) {
      delete form.fieldMap[name];
    }
  }),

  actions: {
    enableValidation() {
      if (!this.get('enabled')) {
        this.set('enabled', true);
        this.validate();
      }
    }
  }
});
