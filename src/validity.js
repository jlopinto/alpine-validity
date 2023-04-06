/* global CustomEvent, MutationObserver */

const checkElementValidity = (target, form) => {
  const validityStates = target.validity

  /* retrieve messages and controls from the element or the parent form */
  const messages = target.__messages || form.__messages || []
  const controls = target.__controls || form.__controls || []

  let errorMessage = false

  /* reset the input validity['customError'] state to false */
  target.setCustomValidity('')

  /* First, checks for native errors */
  for (const state in validityStates) {
    if (!['valid', 'customError'].includes(state) && validityStates[state] === true) {
      errorMessage = messages[state] || target.validationMessage
      break
    }
  }

  /* then if no native errors found, check for custom errors */
  if (!errorMessage) {
    Array.from(controls).find(control => {
      if (!control(target.value)) {
        /* set the input validity['customError'] state true */
        target.setCustomValidity(messages[control.name])
        errorMessage = messages[control.name]
        return true
      }
      return false
    })
  }

  /* dispatch the validation event with the error as detail */
  target.dispatchEvent(new CustomEvent('validation', {
    detail: { error: errorMessage || '', validity: form.checkValidity() },
    bubbles: true
  }))
}
/* handles x-validate:messages */
const handleMessages = (el, expression, evaluateLater, effect) => {
  const getMessages = evaluateLater(expression)
  effect(() => {
    getMessages(data => {
      el.__messages = data
    })
  })
}

/* handles x-validate:controls */
const handleControls = (el, expression, evaluateLater, effect) => {
  const getControls = evaluateLater(expression)
  effect(() => {
    getControls(data => {
      el.__controls = data
    })
  })
}

const handleElements = (el, Alpine) => Alpine.bind(el, {
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

/* handles x-validate */
const handleRoot = (el, Alpine) => {
  const form = el
  const mutations = new MutationObserver(() => {
    form.dispatchEvent(new CustomEvent('validation', {
      detail: { validity: form.checkValidity() }
    }))
  })

  /* watch for childs mutations */
  mutations.observe(form, { childList: true })

  Alpine.bind(form, {
    'x-data' () {
      return {
        __errors: new Map(),
        messages: [],
        get __formElements () {
          return Array.from(form.elements)
            .filter(element => element.willValidate)
        }
      }
    },
    'x-init' () {
      this.__formElements.forEach(el => {
        handleElements(el, Alpine)
      })
    },
    ':novalidate': true,
    '@validation' (ev) {
      const target = ev.target
      if (target.id) {
        this.__errors.set(target.id, ev.detail.error)
      }
    },
    '@submit' () {
      /* trigger a full validation check */
      this.__formElements
        .forEach(element => {
          Alpine.$data(element).__blurred = true
          checkElementValidity(element, form)
        })
    },
    '@input' ({ target }) {
      if (Alpine.$data(target).__canCheck) {
        checkElementValidity(target, target.form)
      }
    },
    '@focusout' ({ target }) {
      if (Alpine.$data(target).__canCheck) {
        checkElementValidity(target, target.form)
      }
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

  Alpine.magic('validity', (el) => subject => Alpine.$data(el).__errors.get(subject))
}
