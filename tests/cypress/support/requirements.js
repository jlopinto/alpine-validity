export default () => describe('Requirements tests', () => {
  beforeEach(() => {
    cy.visit('/tests/cypress/e2e/spec.html')
  })

  it('loads alpine correctly', () => {
    cy.get('#alpine-loaded').contains('alpine-loaded')
  })

  it('loads alpine-validate correctly', () => {
    cy.get('form').each(($el) => {
      cy.wrap($el).should('have.attr', 'novalidate')
    })
  })
})
