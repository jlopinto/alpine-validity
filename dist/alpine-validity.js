const o = (t) => {
  const e = t.validity, i = t.__messages || t.form.__messages || [], s = t.__controls || t.form.__controls || [];
  let r = !1;
  t.setCustomValidity("");
  for (const a in e)
    if (!["valid", "customError"].includes(a) && e[a] === !0) {
      r = i[a] || t.validationMessage;
      break;
    }
  r || s.find((a) => a(t.value) ? !1 : (t.setCustomValidity(i[a.name]), r = i[a.name], !0)), t.dispatchEvent(new CustomEvent("validation", {
    detail: { error: r || "", validity: t.form.checkValidity() },
    bubbles: !0
  }));
}, l = (t, e, i, s) => {
  const r = i(e);
  s(() => {
    r((a) => {
      t.__messages = a;
    });
  });
}, c = (t, e, i, s) => {
  const r = i(e);
  s(() => {
    r((a) => {
      t.__controls = a;
    });
  });
}, d = (t, e) => e.bind(t, {
  "x-data"() {
    return {
      __modified: !1,
      __blurred: !1,
      get __canCheck() {
        return this.__modified && this.__blurred;
      }
    };
  },
  "x-init"() {
    this.$el.__messages = null, this.$el.__controls = null;
  },
  "@input.once"({ target: i }) {
    e.$data(i).__modified = !0;
  },
  "@focusout.once"({ target: i }) {
    e.$data(i).__blurred = !0;
  }
}), _ = (t, e) => {
  const i = new MutationObserver(([s]) => {
    const r = Array.from(t.elements).filter(
      (a) => Array.from(s.addedNodes).filter((n) => n.contains(a)).length && a.tagName !== "BUTTON" && (a.hasAttribute("x-validity:messages") || a.hasAttribute("x-validity:controls"))
    );
    r.forEach((a) => d(a, e)), t.dispatchEvent(new CustomEvent("validation", {
      detail: { validity: t.checkValidity(), appendedControls: r }
    }));
  });
  e.bind(t, {
    "x-data"() {
      return {
        __errors: /* @__PURE__ */ new Map(),
        messages: [],
        get __formElements() {
          return Array.from(this.$el.elements).filter((s) => s.willValidate);
        }
      };
    },
    "x-init"() {
      i.observe(this.$el, { childList: !0 }), this.__formElements.forEach((s) => {
        d(s, e);
      });
    },
    ":novalidate": !0,
    "@validation"(s) {
      const r = s.target;
      r.id && this.__errors.set(r.id, s.detail.error);
    },
    "@submit"() {
      this.__formElements.forEach((s) => {
        e.$data(s).__blurred = !0, o(s);
      });
    },
    "@input"({ target: s }) {
      e.$data(s).__canCheck && o(s);
    },
    "@focusout"({ target: s }) {
      e.$data(s).__canCheck && o(s);
    }
  });
}, u = (t) => {
  t.directive("validity", (e, { value: i, expression: s }, { evaluateLater: r, effect: a }) => {
    switch (i) {
      case "messages":
        l(e, s, r, a);
        break;
      case "controls":
        c(e, s, r, a);
        break;
      default:
        _(e, t);
        break;
    }
  }), t.magic("validity", (e) => (i) => t.$data(e).__errors.get(i));
};
export {
  u as default
};
