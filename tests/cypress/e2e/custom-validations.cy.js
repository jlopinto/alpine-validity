describe('Test custom validations', () => {
  beforeEach(() => {
    cy.visit('/tests/cypress/e2e/spec.html')
  })

  it('displays custom validation message on form submit', () => {
    cy.get('#form-3').within(() => {
      cy.get('input').type('1')
      cy.get('button').click()
      cy.get('.errorMessage').contains('custom error')
    })
  })

  it('removes custom validation message on form submit', () => {
    cy.get('#form-3').within(() => {
      cy.get('button').click()
      cy.get('input').type('123')
      cy.get('.errorMessage').should('be.empty')
    })
  })

  it('removes custom validation message on form submit', () => {
    cy.get('#form-3').within(() => {
      cy.get('button').click()
      cy.get('input').type('123')
      cy.get('input').type('{backspace}{backspace}')
      cy.get('.errorMessage').contains('custom error')
    })
  })
})
