import Controller from '@ember/controller';

export default Controller.extend({
  example: 'number',
  queryParams: ['example'],
  numberDemo: `
    {{#number-field
      value=simpleNumber
      as |field|
    }}
      <input
        type="text"
        placeholder="Enter a number"
        oninput={{action (mut simpleNumber) value="target.value"}}
        value={{simpleNumber}}
      >
      {{#each field.errorMessages as |error|}}
        <p>{{error}}</p>
      {{/each}}
    {{/number-field}}
  `,
  requiredDemo: `
    {{#number-field
      showErrorMessages=true
      required=true
      value=requiredNumber
      as |field|
    }}
      <input
        placeholder="enter a number"
        type="text"
        value={{requiredNumber}}
        oninput={{action (mut requiredNumber) value="target.value"}}
      > *required
      {{#each field.errorMessages as |error|}}
        <p>{{error}}</p>
      {{/each}}
    {{/number-field}}
  `,
  integerDemo: `
    {{#number-field
      value=integer
      integer=true
      as |field|
    }}
      <input
        type="text"
        placeholder="Enter an integer"
        oninput={{action (mut integer) value="target.value"}}
        value={{integer}}
      >
      {{#each field.errorMessages as |error|}}
        <p>{{error}}</p>
      {{/each}}
    {{/number-field}}
  `,
  positiveDemo: `
    {{#number-field
      value=positiveNumber
      positive=true
      as |field|
    }}
      <input
        type="text"
        placeholder="positive number"
        oninput={{action (mut positiveNumber) value="target.value"}}
        value={{positiveNumber}}
      >
      {{#each field.errorMessages as |error|}}
        <p>{{error}}</p>
      {{/each}}
    {{/number-field}}
  `,
  negativeDemo: `
    {{#number-field
      value=negativeNumber
      negative=true
      as |field|
    }}
      <input
        type="text"
        placeholder="negative number"
        oninput={{action (mut negativeNumber) value="target.value"}}
        value={{negativeNumber}}
      >
      {{#each field.errorMessages as |error|}}
        <p>{{error}}</p>
      {{/each}}
    {{/number-field}}
  `,
  minDemo: `
    {{#number-field
      value=minValue
      min=5
      as |field|
    }}
      <input
        type="text"
        placeholder="enter a value"
        oninput={{action (mut minValue) value="target.value"}}
        value={{minValue}}
      > *value must be at least 5
      {{#each field.errorMessages as |errorMessage|}}
        <p>{{errorMessage}}</p>
      {{/each}}
    {{/number-field}}
  `,
  maxDemo: `
    {{#code-demo markup=maxDemo}}
      {{#number-field
        value=minValue
        max=10
        as |field|
      }}
        <wired-input
          type="text"
          placeholder="enter a value"
          oninput={{action (mut minValue) value="target.value"}}
          value={{minValue}}
        ></wired-input> *value must be at most 10
        {{#each field.errorMessages as |errorMessage|}}
          <p>{{errorMessage}}</p>
        {{/each}}
      {{/number-field}}
    {{/code-demo}}
  `,
  gtDemo: `
    {{#number-field
      value=gtValue
      gt=6
      as |field|
    }}
      <input
        type="text"
        placeholder="enter a value"
        oninput={{action (mut gtValue) value="target.value"}}
        value={{gtValue}}
      > *value must be greater than 6
      {{#each field.errorMessages as |errorMessage|}}
        <p>{{errorMessage}}</p>
      {{/each}}
    {{/number-field}}
  `,
  ltDemo: `
    {{#number-field
      value=ltValue
      lt=15
      as |field|
    }}
      <input
        type="text"
        placeholder="enter a value"
        oninput={{action (mut ltValue) value="target.value"}}
        value={{ltValue}}
      > *value must less than 15
      {{#each field.errorMessages as |errorMessage|}}
        <p>{{errorMessage}}</p>
      {{/each}}
    {{/number-field}}
  `,
  stackedDemo: `
    {{#number-field
      value=userAge
      positive=true
      integer=true
      as |field|
    }}
      <input
        type="text"
        placeholder="Enter your age"
        oninput={{action (mut userAge) value="target.value"}}
        value={{userAge}}
      >
      {{#each field.errorMessages as |error|}}
        <p>{{error}}</p>
      {{/each}}
    {{/number-field}}
  `,
  methods: Ember.computed.map('model.methods', function(method) {
    const methodParams = method.get('params').map(function(param) { return param.name; }).join(',');
    const signature = `${method.get('name')}(${methodParams})`;
    return {
      id: method.get('id'),
      name: method.get('name'),
      description: method.get('description'),
      signature: signature,
      params: method.get('params')
    };
  })
});
