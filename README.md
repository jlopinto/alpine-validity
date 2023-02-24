# Alpine Validity

Many forms require basic validation, and using native form validation can be sufficient. However, customizing the appearance of these forms can be challenging.

The AlpineJS "validity" directive offers a solution to this issue by allowing you to display error messages in a clear and concise manner. This directive utilizes the native API to provide seamless integration with your existing form elements, making it an efficient and straightforward solution for client-side form validation.

![npm bundle size (version)](https://img.shields.io/bundlephobia/min/@blo4r/x-validity/latest?style=flat)
![dependency count](https://badgen.net/bundlephobia/dependency-count/@blo4r/x-validity)
![GitHub Workflow Status](https://github.com/jlopinto/x-validity/actions/workflows/main.yml/badge.svg)

## Installation

### CDN

Include the following `<script>` tag in the `<head>` of your document, just before Alpine.

```html
<script
  src="https://cdn.jsdelivr.net/npm/@blo4r/x-validity@0.x.x/dist/alpine-validity.min.js"
  defer
></script>
```

### NPM

```bash
npm install @blo4r/x-validity
```

Add the `x-validity` directive to your project by registering the plugin with Alpine.

```js
import Alpine from "alpinejs"
import { Validity } from "@blo4r/alpine-validity"

Alpine.plugin(Validity)

window.Alpine = Alpine
window.Alpine.start()
```

## Usage

### Display native validation messages

```html
<form x-data x-validity>
  <div x-data="{error: ''}" @validation="error = $event.detail.error">
    <input type="email" required />
    <div x-text="error"></div>
  </div>
  <button>Submit</button>
</form>
```

[Codepen demo](https://codepen.io/blo4r/pen/PoBreGG)

### Customize native validation messages

```html
<script>
  const customMessages = {
    valueMissing: "You forgot to enter your email address!",
    typeMismatch: "This appears to be an invalid email address."
  }
</script>
<form x-data x-validity x-validity:messages="customMessages">
  <div x-data="{error: ''}" @validation="error = $event.detail.error">
    <input type="email" required />
    <div x-text="error"></div>
  </div>
  <button>Submit</button>
</form>
```

[Codepen demo](https://codepen.io/blo4r/pen/gOjNzgw)

### Override custom validation messages

```html
<script>
  const customFormMessages = {
    valueMissing: "This field is mandatory",
    typeMismatch: "Please enter an email."
  }

  const customInputMessages = {
    valueMissing: "You forgot to enter your email address!",
    typeMismatch: "This appears to be an invalid email address."
  }
</script>
<form x-data x-validity x-validity:messages="customFormMessages">
  <div x-data="{error: ''}" @validation="error = $event.detail.error">
    <input type="email" required x-validity:messages="customInputMessages" />
    <div x-text="error"></div>
  </div>
  <button>Submit</button>
</form>
```

[Codepen demo](https://codepen.io/blo4r/pen/gOjNzgw)

### Add custom controls and messsages

```html
<script>
  const morethan5 = (value) => value.length > 5
</script>

<form x-data x-validity>
  <div x-data="{error: ''}" @validation="error = $event.detail.error">
    <input
      type="email"
      required
      x-validity:controls="morethan5"
      x-validity:messages="{morethan5: 'Provide a value longer than 5 character'}"
    />
    <div x-text="error"></div>
  </div>
  <button>Submit</button>
</form>
```

[Codepen demo](https://codepen.io/blo4r/pen/yLqdjgj)

### Modifiers

`x-validity` provide two modifiers.

| Modifier                   | Description                     | Usage                                                         |
| -------------------------- | ------------------------------- | ------------------------------------------------------------- |
| `x-validity:messages="[]"` | Change the native message error | `x-validity:messages="{'<error_name>': '<error text>', ...}"` |
| `x-validity:controls"{}"`  | Add custom controls             | `x-form:controls="[<custom control function>, ...]"`          |
|                            |

## Versioning

This projects follow the [Semantic Versioning](https://semver.org/) guidelines.

## License

Copyright (c) 2023 Julien Lopinto and contributors

Licensed under the MIT license, see [LICENSE.md](LICENSE.md) for details.
