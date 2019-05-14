import Controller from '@ember/controller';

export default Controller.extend({
  example: 'date',
  queryParams: ['example'],
  todaysDate: Ember.computed(function() {
    return new Date();
  }),
  dateDemo: `
    {{#date-field
      disabled=false
      value=date
      as |field|
    }}
      <input
        type="text"
        placeholder="Enter a date"
        oninput={{action (mut date) value="target.value"}}
        value={{date}}
      >*ex. january 31, 1988
      {{#each field.errorMessages as |error|}}
        <p>{{error}}</p>
      {{/each}}
    {{/date-field}}
  `,
  requiredDemo: `
    {{#date-field
      showErrorMessages=true
      disabled=false
      value=requiredDate
      required=true
      as |field|
    }}
      <input
        type="text"
        placeholder="Enter a date"
        oninput={{action (mut requiredDate) value="target.value"}}
        value={{requiredDate}}
      >*required
      {{#each field.errorMessages as |error|}}
        <p>{{error}}</p>
      {{/each}}
    {{/date-field}}
  `,
  futureDateDemo: `
    {{#date-field
      disabled=false
      value=minDate
      min=todaysDate
      required=true
      as |field|
    }}
      <input
        type="text"
        placeholder="Future date"
        oninput={{action (mut minDate) value="target.value"}}
        value={{minDate}}
      >*ex. april 6, 2050
      {{#each field.errorMessages as |error|}}
        <p>{{error}}</p>
      {{/each}}
    {{/date-field}}
  `,
  pastDateDemo: `
    {{#date-field
      disabled=false
      value=maxDate
      required=true
      max=todaysDate
      as |field|
    }}
      <input
        type="text"
        placeholder="Past date"
        oninput={{action (mut maxDate) value="target.value"}}
        value={{maxDate}}
      >*ex. december 12, 1984
      {{#each field.errorMessages as |error|}}
        <p>{{error}}</p>
      {{/each}}
    {{/date-field}}
  `,
  inclusiveDateDemo: `
    {{#date-field
      disabled=false
      value=inclusiveDate
      min="January 1, 2019"
      max="December 31, 2019"
      as |field|
    }}
      <input
        type="text"
        placeholder="Enter a 2019 date"
        oninput={{action (mut inclusiveDate) value="target.value"}}
        value={{inclusiveDate}}
      >*ex. April 19, 2019
      {{#each field.errorMessages as |error|}}
        <p>{{error}}</p>
      {{/each}}
    {{/date-field}}
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
