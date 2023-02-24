const f = (c) => {
  const r = (i, e) => {
    const n = i.validity, s = i._x_validity_messages || e._x_validity_messages || [], _ = i._x_validity_controls || e._x_validity_controls || [];
    let d = !1, t;
    i.setCustomValidity("");
    for (const l in n)
      if (!["valid", "customError"].includes(l) && n[l] === !0) {
        d = !0, t = s[l] || i.validationMessage;
        break;
      }
    d || _.find((l) => (d = !l(i.value), d ? (i.setCustomValidity(s[l.name]), t = s[l.name], !0) : !1)), i.dispatchEvent(new CustomEvent("validation", {
      detail: { error: d ? t : "", validity: e.checkValidity() },
      bubbles: !0
    }));
  }, v = (i, e, n, s, _) => {
    const d = n(s);
    _(() => {
      d((t) => {
        e[`_x_validity_${i}`] || (e[`_x_validity_${i}`] = {}), e[`_x_validity_${i}`] = t;
      });
    });
  };
  c.directive("validity", (i, { value: e, expression: n }, { evaluateLater: s, effect: _, cleanup: d }) => {
    if (e === "controls")
      v("controls", i, s, n, _);
    else if (e === "messages")
      v("messages", i, s, n, _);
    else {
      const t = i;
      new MutationObserver(() => {
        t.dispatchEvent(new CustomEvent("validation", {
          detail: { validity: t.checkValidity() }
        }));
      }).observe(t, { childList: !0 }), t.setAttribute("novalidate", !0), ["input", "change"].forEach((o) => t.addEventListener(
        o,
        ({ target: a, type: u }) => {
          if ((a._x_validity_modified ?? !1) && u === "input" && (a._x_validity_modified = !0), !(a._x_validity_blurred ?? !1) && u === "change" && (a._x_validity_blurred = !0), !a._x_validity_blurred && !a._x_validity_modified)
            return !1;
          r(a, a.form);
        }
      )), t.addEventListener("submit", () => {
        Array.from(t.elements).filter((o) => o.willValidate).forEach((o) => {
          o._x_validity_blurred = !0, r(o, t);
        });
      });
    }
  });
};
export {
  f as default
};
