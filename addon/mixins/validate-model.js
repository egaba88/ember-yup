import Ember from 'ember'
import Mixin from '@ember/object/mixin';
import RSVP from 'rsvp';
import * as yup from 'yup';
import { assign } from '@ember/polyfills';
import { computed } from '@ember/object';
import DS from 'ember-data';

const VALIDATION_ALIASES = {
  lt: 'lessThan',
  gt: 'moreThan',
  mt: 'moreThan',
  gte: 'min',
  lte: 'max',
};

const ALLOWABLE_DATA_TYPES = ['mixed', 'text', 'string', 'number', 'boolean', 'bool', 'date', 'array', 'object', undefined];

const DATA_TYPE_ALIASES = {
  'boolean': 'bool',
  'text': 'string',
};

const DEFAULT_VALIDATE_OPTIONS = {
  abortEarly: false,
};

 /**
  * This mixin allows the model to validate values against its schema.
  *
  * @class ValidateModelMixin
  */
export default Mixin.create({
  /**
   * The schema used to validate data against.
   *
   * @property {Schema} schema
   * @readOnly
   */
  schema: computed(function() {
    const schemaAttrs = {};

    this.eachAttribute((name, attr) => {
      const dataType = attr.type;
      const validationOptions = attr.options && attr.options.validate || {};
      const schema = yup[dataType] && yup[dataType]();

      schemaAttrs[name] = this._buildSchema(schema, validationOptions);
    });

    return yup.object().shape(schemaAttrs);
  }).readOnly(),

 /**
  * Flag to tell whether or not the record is in process of an async validation.
  * @property isValidating
  */
  isValidating: false,

  /**
   * Flag to tell whether or not the record has failed validation.
   * @property isInvalid
   */
  isInvalid: Ember.computed('isValid', 'errors.[]', function() {
    return this.get('errors.length') > 0 || !this.get('isValid');
  }),

  /**
   * Validate the record's values against the schema.
   *
   * @function validate
   * @param {Object} options
   * @param {Object} values
   */
  validate(options = {}, values = this.toJSON()) {
    options = assign({}, DEFAULT_VALIDATE_OPTIONS, options);

    const validation = new RSVP.Promise((resolve, reject) => {
      if (options.path) {
        this._preValidate(true);
        this.get('schema').validateAt(options.path, values, options)
          .then(resolve)
          .catch(reject);
      } else {
        this._preValidate();
        this.get('schema').validate(values, options)
          .then(resolve)
          .catch(reject);
      }
    });

    validation.then((values) => {
      this._postValidate(false, values);
    }).catch((validations) => {
      this._postValidate(true, validations);
    });

    return validation;
  },


  /**
   * validateAt
   *
   * @function validateAt
   * @param {String} path
   * @param {Object} options
   * @param {Object} values
   */
  validateAt(path, options = {}, values = this.toJSON()) {
    return this.validate(assign({}, options, { path }), values);
  },

  /**
   * Same as validate, except synchronous.
   *
   * @function validateSync
   * @param {Object} options
   * @param {Object} values
   */
  validateSync(options = {}, values = this.toJSON()) {
    let isInvalid = false;

    try {
      options = assign({}, DEFAULT_VALIDATE_OPTIONS, options);

      if (options.path) {
        this._preValidate(true);
        values = this.get('schema').validateSyncAt(options.path, values, options);
      } else {
        this._preValidate();
        values = this.get('schema').validateSync(values, options);
      }
    } catch(validations) {
      values = validations;
      isInvalid = true;
    }

    this._postValidate(isInvalid, values);

    return !this.get('isInvalid');
  },

  /**
   * validateSyncAt
   *
   * @function validateSyncAt
   * @param {String} path
   * @param {Object} options
   * @param {Object} values
   */
  validateSyncAt(path, options = {}, values = this.toJSON()) {
    return this.validateSync(assign({}, options, { path }), values);
  },

  /**
   * Adds a `validate` option to `save()`.
   * This ensures that only valid data is saved.
   * @function save
   * @param {Object} options `validate` option ensures only valid values are saved
   * @return {Promise}
   */
  save(options = {}) {
    if (options.validate) {
      return new RSVP.Promise((resolve, reject) => {
        this.validateSync(options);

        if (this.get('isInvalid')) {
          const error = new DS.InvalidError(this.get('errors').map(function(err) {
            return {
              detail: err.message,
              source: { pointer: `/data/attributes/${err.attribute}` }
            }
          }));

          reject(error);
        } else {
          this._super(options).then(resolve).catch(reject);
        }
      });
    }

    return this._super(options);
  },

  /**
   * Parses validation options and applies them to the schema.
   * @function _buildSchema
   * @param {Schema} schema Yup schema; defaults to `yup.mixed()`
   * @param {Object} options `validate` options read from `DS.attr()`
   * @private
   */
  _buildSchema(schema = yup.mixed(), options = {}) {
    schema = schema.nullable();

    for (let optionName in options) {
      optionName = VALIDATION_ALIASES[optionName] || optionName;

      if (!/message|dataType/i.test(optionName)) {
        const config = options[optionName];

        try {
          const typeErrorMessage = options['typeMessage'];
          if (typeErrorMessage) {
            schema = schema.typeError(typeErrorMessage);
          }

          if (optionName === 'of') {
            if (!ALLOWABLE_DATA_TYPES.includes(config.dataType)) {
              throw new TypeError(`Unallowed schema type ${config.dataType}`);
            }

            const dataType = DATA_TYPE_ALIASES[config.dataType] || config.dataType || 'mixed';
            const arrayChildSchema = yup[dataType] && yup[dataType]();

            const arrayChildSchemaConfig = assign({}, config);
            delete arrayChildSchemaConfig.dataType;

            schema = schema.of(this._buildSchema(arrayChildSchema, arrayChildSchemaConfig));
          } else if (optionName === 'when') {
            for (const dependentKey in config) {
              const schemaOptions = config[dependentKey];
              schema = schema[optionName](dependentKey, {
                is: schemaOptions.is,
                then: this._buildSchema(schema.clone(), schemaOptions.then),
                otherwise: this._buildSchema(schema.clone(), schemaOptions.otherwise)
              });
            }
          } else if (typeof schema[optionName] === 'function') {
            const shouldIncludeValue = /oneOf|equals|email|url|integer|positive|negative|moreThan|lessThan|mt|lt|gt|min|max|matches/i.test(optionName); // TODO improve
            let message;

            const messageKey = options[optionName + 'MessageKey'];
            if (messageKey && this.intl) {
              message = this.intl.lookup(messageKey, this.intl.get('locales'), {
                resilient: true
              });
            } else {
              message = options[optionName + 'Message'];
            }

            if (shouldIncludeValue) {
              schema = schema[optionName](config, message);
            } else {
              schema = schema[optionName](message);
            }
          } else if (optionName === 'type' && typeof schema[config] === 'function') {
            const messageKey = options[`${config}MessageKey`] || options['typeMessageKey'];
            let message;

            if (messageKey && this.intl) {
              message = this.intl.lookup(messageKey, this.intl.get('locales'), {
                resilient: true
              });
            } else {
              message = options[`${optionName}Message`] || options[`${config}Message`] || typeErrorMessage;
            }

            schema = schema[config](message);
          } else {
            if (/type|matches|email|url/.test(optionName)) {
              Ember.Logger.warn(optionName, 'option only available for `string` schema type. Define the attribute as a `string`.');
            } else if (/integer|positive|negative|lessThan|moreThan/.test(optionName)) {
              Ember.Logger.warn(optionName, 'option only available for `number` schema type. Define the attribute as a `number`.');
            }
          }
        } catch(e) {
          Ember.Logger.error(e);
        }
      }
    }

    return schema;
  },

  /**
   * A hook that is called before validating (`validate` or `validateSync`)
   * @function preValidate
   */
  _preValidate(isValidatingPath = false) {
    if (typeof this.preValidate === 'function') {
      this.preValidate();
    }

    if (!isValidatingPath) {
      this.get('errors').clear();
    }

    this.set('isValidating', true);
  },

  /**
   * A hook that is called after validation has occured and `errors` is populated
   *
   * @function postValidate
   * @hook
   * @param {Boolean} isInvalid `true` if there were validation errors
   * @param {Object} data if `isInvalid`, data are Yup's ValidationErrors; otherwise, the transformed values
   */
  _postValidate(isInvalid = false, data) {
    if (isInvalid) {
      this.send('becomeDirty');

      const errors = this.get('errors');
      if (data && data.inner) {
        data.inner.forEach(function(validation) {
          errors.add(validation.path, validation.errors);
        });
      }
    }

    this.setProperties({
      isValidating: false,
    });

    if (typeof this.postValidate === 'function') {
      this.postValidate(...arguments);
    }
  },
});
