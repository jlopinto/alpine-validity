/* global CustomEvent, MutationObserver */

/* todo: use Map (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) */
const config = {}

const checkElementValidity = (target) => {
  const constraints = {
    ...config[target.type],
    ...target.form.__controls,
    ...target.__controls
  }
  const validityStates = target.validity

  let errors = []

  /* reset the input validity['customError'] state to false */
  target.setCustomValidity("")
  /* First, checks for native errors */
  if (!validityStates["valid"]) {
    for (const state in validityStates) {
      if (validityStates[state] === true) {
        errors.push({
          target,
          name: state,
          valid: false,
          message:
            constraints && constraints[state]
              ? constraints[state]?.message
              : target.validationMessage
        })
      }
    }
  }

  /* then check for custom errors */
  errors = [
    ...errors,
    ...Object.keys(constraints)
      .filter((constraintName) => {
        const { validationTest, message } = constraints[constraintName]
        return typeof validationTest === "function"
      })
      .map((constraintName) => {
        const { validationTest, message } = constraints[constraintName]
        return {
          target,
          name: constraintName,
          valid: validationTest(target.value),
          message
        }
      })
  ]

  /* dispatch the validation event with the errors as detail */
  target.dispatchEvent(
    new CustomEvent("validation", {
      detail: { errors, validity: target.form.checkValidity() },
      bubbles: true
    })
  )
}

/* handles x-validity:controls="{...}" */
const handleControls = (el, expression, evaluateLater, effect) => {
  const getControls = evaluateLater(expression)
  effect(() => {
    getControls((data) => {
      el.__controls = data
    })
  })
}

/* initiate form element */
const handleElement = (el, Alpine) =>
  Alpine.bind(el, {
    "x-data"() {
      return {
        isModified: false,
        isBlurred: false,
        get() {
          return this.isModified && this.isBlurred
        }
      }
    },
    "x-init"() {
      this.$el.__controls = null
    },
    "@input.once"({ target }) {
      Alpine.$data(target).isModified = true
    },
    "@focusout.once"({ target }) {
      Alpine.$data(target).isBlurred = true
    }
  })

/* handles x-validity */
const handleRoot = (form, expression, evaluateLater, effect, Alpine) => {
  const formFieldsMutations = new MutationObserver(([mutation]) => {
    const appendedControls = Array.from(form.elements).filter((element) => {
      return Array.from(mutation.addedNodes).filter((addedNode) => {
        return (
          addedNode.contains(element).length &&
          !(element.tagName instanceof HTMLButtonElement) &&
          (element.hasAttribute("x-validity:messages") ||
            element.hasAttribute("x-validity:controls"))
        )
      })
    })

    appendedControls.forEach((appendedControl) =>
      handleElement(appendedControl, Alpine)
    )

    form.dispatchEvent(
      new CustomEvent("validation", {
        detail: { validity: form.checkValidity(), appendedControls }
      })
    )
  })

  handleControls(form, expression, evaluateLater, effect)

  Alpine.bind(form, {
    "x-data"() {
      return {
        formErrors: new Map(),
        messages: [],
        get getFormElement() {
          return Array.from(this.$el.elements).filter(
            (element) =>
              element.willValidate && !(element instanceof HTMLButtonElement)
          )
        }
      }
    },
    "x-init"() {
      /* watch for childs mutations */
      formFieldsMutations.observe(this.$el, { childList: true })
      this.getFormElement.forEach((el) => handleElement(el, Alpine))
    },
    ":novalidate": true,
    "@validation"(ev) {
      const target = ev.target
      if (target.name) {
        this.formErrors.set(target.name, ev.detail.errors)
      }
    },
    "@submit"() {
      /* trigger a full validation check */
      this.getFormElement.forEach((element) => {
        Alpine.$data(element).isBlurred = true
        checkElementValidity(element)
      })
    },
    "@input"({ target }) {
      checkElementValidity(target)
    },
    "@reset"() {
      this.formErrors.clear()
      this.getFormElement.forEach((element) => {
        Alpine.$data(element).isModified = false
        Alpine.$data(element).isBlurred = false
        element.setCustomValidity("")
      })
    }
  })
}

export default (Alpine, customConfig = {}) => {
  Object.assign(config, customConfig)

  Alpine.directive(
    "validity",
    (el, { value, expression }, { evaluateLater, effect }) => {
      if (value === "controls")
        handleControls(el, expression, evaluateLater, effect)
      if (value === null)
        handleRoot(el, expression, evaluateLater, effect, Alpine)
    }
  )

  Alpine.magic("validity", (control) => (subject) => {
    return Alpine.$data(control).formErrors.get(subject)
  })
}
