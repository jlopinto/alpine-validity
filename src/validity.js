/* global CustomEvent, MutationObserver */

export default (Alpine) => {
  const checkElementValidity = (target, form) => {
    const validityStates = target.validity

    /* retrieve messages and controls from the element or the parent form */
    const messages = target._x_validity_messages || form._x_validity_messages || []
    const controls = target._x_validity_controls || form._x_validity_controls || []

    let validationFailed = false
    let errorMessage

    /* reset the input validity['customError'] state to false */
    target.setCustomValidity('')

    /* First, checks for native errors */
    for (const state in validityStates) {
      if (!['valid', 'customError'].includes(state) && validityStates[state] === true) {
        validationFailed = true
        errorMessage = messages[state] || target.validationMessage
        break
      }
    }

    /* then if no native errors found, check for custom errors */
    if (!validationFailed) {
      controls.find((control) => {
        validationFailed = !control(target.value)
        if (validationFailed) {
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
      detail: { error: validationFailed ? errorMessage : '', validity: form.checkValidity() },
      bubbles: true
    }))
  }

  const setCustomProps = (propsName, el, evaluateLater, expression, effect) => {
    const getControls = evaluateLater(expression)
    effect(() => {
      getControls(data => {
        if (!el[`_x_validity_${propsName}`]) {
          el[`_x_validity_${propsName}`] = {}
        }
        el[`_x_validity_${propsName}`] = data
      })
    })
  }

  Alpine.directive('validity', (el, { value, expression }, { evaluateLater, effect, cleanup }) => {
    if (value === 'controls') {
      /* handles x-validate:controls */
      setCustomProps('controls', el, evaluateLater, expression, effect)
    } else if (value === 'messages') {
      /* handles x-validate:messages */
      setCustomProps('messages', el, evaluateLater, expression, effect)
    } else {
      /* handles x-validate */
      const form = el
      const mutations = new MutationObserver(() => {
        form.dispatchEvent(new CustomEvent('validation', {
          detail: { validity: form.checkValidity() }
        }))
      })

      /* watch for childs mutations */
      mutations.observe(form, { childList: true })

      /* disable native validation behavior */
      form.setAttribute('novalidate', true)

      /* trigger validition logic */
      const VALIDATION_EVENTS = ['input', 'change']
      VALIDATION_EVENTS.forEach(eventName => form.addEventListener(
        eventName,
        ({ target, type }) => {
          if ((target._x_validity_modified ?? false) && type === 'input') {
            target._x_validity_modified = true
          }

          if (!(target._x_validity_blurred ?? false) && type === 'change') {
            target._x_validity_blurred = true
          }

          if (!target._x_validity_blurred && !target._x_validity_modified) {
            return false
          }

          checkElementValidity(target, target.form)
        }
      ))

      /* trigger a full validation check */
      form.addEventListener('submit', () => {
        Array.from(form.elements)
          .filter(element => element.willValidate)
          .forEach(element => {
            element._x_validity_blurred = true
            checkElementValidity(element, form)
          })
      })
    }
  })
}
