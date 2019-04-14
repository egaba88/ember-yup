import Controller from '@ember/controller';

export default Controller.extend({
  validationFormExample: `
    {{#validation-form
      onSubmit=(action "submitValidationForm")
      onReject=(action "rejectValidationForm")
      as |form|
    }}
      {{#text-field requiredMessage="username is required" name="username" form=form required=true value=validationFormName}}
        <input
          type="text"
          placeholder="username"
          oninput={{action (mut validationFormName) value="target.value"}}
          value={{validationFormName}}
        > * required
        {{#if form.errors.username.length}}
          <ul>
            {{#each form.errors.username as |errorMessage|}}
              <li style="color: red;">{{errorMessage}}</li>
            {{/each}}
          </ul>
        {{/if}}
      {{/text-field}}
      {{#number-field requiredMessage="age is required" name="age" form=form integer=true positive=true required=true value=validationFormAge}}
        <input
          type="text"
          placeholder="age"
          oninput={{action (mut validationFormAge) value="target.value"}}
          value={{validationFormAge}}
        > * required
        {{#if form.errors.age.length}}
          <ul>
            {{#each form.errors.age as |errorMessage|}}
              <li style="color: red;">{{errorMessage}}</li>
            {{/each}}
          </ul>
        {{/if}}
      {{/number-field}}
      {{#text-field form=form name="validationFormEmail" value=validationFormEmail type="email" requiredMessage="email is required"}}
        <input
          placeholder="email"
          type="text"
          value={{validationFormEmail}}
          oninput={{action (mut validationFormEmail) value="target.value"}}
        >
        {{#if form.errors.validationFormEmail.length}}
          <ul>
            {{#each form.errors.validationFormEmail as |errorMessage|}}
              <li style="color: red;">{{errorMessage}}</li>
            {{/each}}
          </ul>
        {{/if}}
      {{/text-field}}

      {{#if validationFormSuccessData}}
        <div class="">
          success! {{validationFormSuccessData}}
        </div>
      {{/if}}
      <button type="submit">validate</button>
    {{/validation-form}}
  `,
  validUsernameExample: `
    {{#text-field
      required=true
      requiredMessage="name is required"
      value=username
      as |field|
    }}
      <input
        placeholder="username"
        type="text"
        value={{username}}
        oninput={{action (mut username) value="target.value"}}
        onblur={{action field.enable}}
      > *required
      {{#each field.errors as |errorMessage|}}
        <p style="color: red;">{{errorMessage}}</p>
      {{/each}}
    {{/text-field}}
  `,
  validEmailExample: `
    {{#text-field
      type="email"
      value=validEmail
      required=true
      emailMessage="this email address is invalid"
      as |field|
    }}
      <input
        placeholder="Email address"
        type="text"
        value={{validEmail}}
        oninput={{action (mut validEmail) value="target.value"}}
        onblur={{action field.enable}}
      > *required
      {{#each field.errors as |errorMessage|}}
        <p style="color: red;">{{errorMessage}}</p>
      {{/each}}
    {{/text-field}}
  `,
  charLimitExample: `
    {{#text-field
      enabled=true
      charLimit=10
      value=charLimit
      as |field|
    }}
      <input
        placeholder="Short message"
        type="text"
        value={{charLimit}}
        oninput={{action (mut charLimit) value="target.value"}}
      >
      <span>char remaining: {{field.charRemaining}}</span>
      {{#each field.errors as |errorMessage|}}
        <p style="color: red;">{{errorMessage}}</p>
      {{/each}}
    {{/text-field}}
  `,
  basicNumberExample: `
    {{#number-field enabled=true value=validatedNumberExample as |field|}}
      <input
        type="text"
        placeholder="Enter a number"
        oninput={{action (mut validatedNumberExample) value="target.value"}}
        value={{validatedNumberExample}}
      >
      {{#each field.errors as |errorMessage|}}
        <p style="color: red;">{{errorMessage}}</p>
      {{/each}}
    {{/number-field}}
  `,
  integerExample: `
    {{#number-field enabled=true value=validatedIntegerExample integer=true as |field|}}
      <input
        type="text"
        placeholder="Enter a number"
        oninput={{action (mut validatedIntegerExample) value="target.value"}}
        value={{validatedIntegerExample}}
      >
      {{#each field.errors as |errorMessage|}}
        <p style="color: red;">{{errorMessage}}</p>
      {{/each}}
    {{/number-field}}
  `,
  positiveIntegerExample: `
    {{#number-field
      enabled=true
      value=validatedAgeExample
      positive=true
      integer=true
      as |field|
    }}
      <input
        type="text"
        placeholder="Enter your age"
        oninput={{action (mut validatedAgeExample) value="target.value"}}
        value={{validatedAgeExample}}
      >
      {{#each field.errors as |errorMessage|}}
        <p style="color: red;">{{errorMessage}}</p>
      {{/each}}
    {{/number-field}}
  `,
  numberRangeExample: `
    {{#number-field
      enabled=true
      value=validatedRangeExample
      min=30
      max=50
      as |field|
    }}
      <input
        type="text"
        placeholder="number range"
        oninput={{action (mut validatedRangeExample) value="target.value"}}
        value={{validatedRangeExample}}
      >
      {{#each field.errors as |errorMessage|}}
        <p style="color: red;">{{errorMessage}}</p>
      {{/each}}
    {{/number-field}}
  `,
  actions: {
    submitValidationForm(data) {
      console.log('submission success', data);
      this.set('validationFormErrors', {});
      this.set('validationFormSuccessData', JSON.stringify(data));
    },
    rejectValidationForm(errors) {
      this.set('validationFormErrors', errors);
      this.set('validationFormSuccessData', null);
      console.log('submission error', errors);
    }
  }
});
