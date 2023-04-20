describe('Test native validation messages override', () => {
  beforeEach(() => {
    cy.visit('/tests/cypress/e2e/spec.html')
  })

  it('displays custom validation message on form submit', () => {
    cy.get('#form-2').within(() => {
      cy.get('button').click()
      cy.get('.errorMessage').contains('valueMissing custom')
    })
  })

  it('removes custom validation message on type', () => {
    cy.get('#form-2').within(() => {
      cy.get('button').click()
      cy.get('input').type('some value')
      cy.get('.errorMessage').should('be.empty')
    })
  })
})
