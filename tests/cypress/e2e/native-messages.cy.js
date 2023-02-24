describe('Test native validation messages', () => {
  beforeEach(() => {
    cy.visit('/spec.html')
  })

  it('displays native validation message on form submit', () => {
    cy.get('#form-1').within(() => {
      cy.get('button').click()
      cy.get('.errorMessage').contains('Please fill out this field.')
    })
  })

  it('removes native validation message on type', () => {
    cy.get('#form-1').within(() => {
      cy.get('button').click()
      cy.get('input').type('some value')
      cy.get('.errorMessage').should('be.empty')
    })
  })
})
