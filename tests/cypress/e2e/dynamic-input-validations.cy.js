describe('Test validation on dynamic inputs', () => {
  beforeEach(() => {
    cy.visit('/tests/cypress/e2e/spec.html')
  })

  it('displays native validation message on form submit', () => {
    cy.get('#form-4').within(() => {
      cy.get('.add-btn').click()
      cy.get('[type="submit"]').click()

      cy.get('.form-row').last().within(() => {
        cy.get('.input-name .errorMessage').contains('Please fill out this field.')
        cy.get('.input-mail .errorMessage').contains('Please fill out this field.')

        cy.get('.input-name input').type('robert')
        cy.get('.input-name .errorMessage').should('be.empty')

        cy.get('.input-mail input').type('robert')
        cy.get('.input-mail .errorMessage').contains("Please include an '@' in the email address. 'robert' is missing an '@'.")

        cy.get('.input-mail input').type('@mail.com')
        cy.get('.input-mail .errorMessage').should('be.empty')
      })
      cy.get('.form-status').contains('valid')
    })
  })
})
