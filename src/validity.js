/* global CustomEvent, MutationObserver */

const checkElementValidity = (target) => {
  if (!target.name) return

  const validityStates = target.validity

  /* retrieve messages and controls from the element or the parent form */
  const messages = target.__messages || target.form.__messages || []
  const controls = target.__controls || target.form.__controls || []

  let errors = []

  /* reset the input validity['customError'] state to false */
  target.setCustomValidity('')
  console.log(target.name)
  /* First, checks for native errors */
  for (const state in validityStates) {
    // console.log(state, validityStates[state])
    if (validityStates[state] === true) {
      console.log(messages[state] || target.validationMessage)
      errors.push({ target, name: state, valid: messages[state], message: messages[state] || target.validationMessage })
    }
  }

  console.log(errors)

  /* then check for custom errors */
  errors = Object.assign(errors, controls.map((control) => {
    return { target, name: control.name, valid: control(target.value), message: messages[control.name] }
    // if (!control(target.value)) {
    //   /* set the input validity['customError'] state to true */
    //   errorMessage = messages[control.name]
    //   target.setCustomValidity(errorMessage)
    // }
  }))
  console.log(errors)
  /* dispatch the validation event with the error as detail */
  target.dispatchEvent(new CustomEvent('validation', {
    detail: { errors, validity: target.form.checkValidity() },
    bubbles: true
  }))
}

/* handles x-validity:messages="{control1: "control message 1", control2: "control message 2"}" */
const handleMessages = (el, expression, evaluateLater, effect) => {
  const getMessages = evaluateLater(expression)
  effect(() => {
    getMessages(data => {
      el.__messages = data
    })
  })
}

/* handles x-validity:controls="[control1, control2, ...]" */
const handleControls = (el, expression, evaluateLater, effect) => {
  const getControls = evaluateLater(expression)
  effect(() => {
    getControls(data => {
      el.__controls = data
    })
  })
}

/* initiate form element */
const handleElement = (el, Alpine) => Alpine.bind(el, {
  'x-data' () {
    return {
      __modified: false,
      __blurred: false,
      get __canCheck () {
        return this.__modified && this.__blurred
      }
    }
  },
  'x-init' () {
    this.$el.__messages = null
    this.$el.__controls = null
  },
  '@input.once' ({ target }) {
    Alpine.$data(target).__modified = true
  },
  '@focusout.once' ({ target }) {
    Alpine.$data(target).__blurred = true
  }
})

/* handles x-validity */
const handleRoot = (form, Alpine) => {
  const mutations = new MutationObserver(([mutation]) => {
    const appendedControls = Array.from(form.elements).filter((element) =>
      Array.from(mutation.addedNodes)
        .filter((addedNode) => {
          return addedNode.contains(element).length && element.tagName !== 'BUTTON' && (element.hasAttribute('x-validity:messages') || element.hasAttribute('x-validity:controls'))
        })
    )

    appendedControls.forEach((appendedControl) => handleElement(appendedControl, Alpine))

    form.dispatchEvent(new CustomEvent('validation', {
      detail: { validity: form.checkValidity(), appendedControls }
    }))
  })

  Alpine.bind(form, {
    'x-data' () {
      return {
        __errors: new Map(),
        messages: [],
        get __formElements () {
          return Array.from(this.$el.elements)
            .filter(element => element.willValidate)
        }
      }
    },
    'x-init' () {
      /* watch for childs mutations */
      mutations.observe(this.$el, { childList: true })
      this.__formElements.forEach(el => handleElement(el, Alpine))
    },
    ':novalidate': true,
    '@validation' (ev) {
      const target = ev.target
      if (target.name) {
        this.__errors.set(target.name, ev.detail.errors)
      }
    },
    '@submit' () {
      /* trigger a full validation check */
      this.__formElements
        .forEach(element => {
          Alpine.$data(element).__blurred = true
          checkElementValidity(element)
        })
    },
    '@input' ({ target }) {
      if (Alpine.$data(target).__canCheck) {
        checkElementValidity(target)
      }
    },
    '@reset' () {
      this.__errors.clear()
      this.__formElements
        .forEach(element => {
          Alpine.$data(element).__modified = false
          Alpine.$data(element).__blurred = false
          element.setCustomValidity('')
        })
    }
  })
}

export default (Alpine) => {
  Alpine.directive('validity', (el, { value, expression }, { evaluateLater, effect }) => {
    switch (value) {
      case 'messages':
        handleMessages(el, expression, evaluateLater, effect)
        break
      case 'controls':
        handleControls(el, expression, evaluateLater, effect)
        break
      default:
        handleRoot(el, Alpine)
        break
    }
  })

  Alpine.magic('validity', (control) => subject => {
    // Alpine.$data(fieldName).__errors.get(subject)
    return {
      get errors () {
        return Alpine.$data(control).__errors.get(subject)
      },
      get firstError () {
        return Alpine.$data(control).__errors.get(subject)
      },
      error (name) {
        const errors = Alpine.$data(control).__errors.get(subject)
        console.log(errors)
        return errors ? errors.find(error => error.name === name) : []
      }
    }
  })
}
