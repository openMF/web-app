describe('Login Page', () => {
  it('Visits the initial web page', () => {
    cy.visit('/');
    cy.url().should('includes', 'login');
    cy.get('#mat-input-0').should ('be.visible');
    cy.get('#mat-input-1').should ('be.visible');
    cy.contains('Login');
    cy.contains('Remember me');
  });

  it('Login', () => {
    cy.visit('/');
    cy.get('#mat-input-0').type('mifos');
    cy.get('#mat-input-1').type('password');
    cy.get('.mat-raised-button').click();
    cy.contains('Home');
  });

  it('Logout', () => {
    cy.visit('/#/home');
    cy.get('.img-button').click();
    cy.get('#logout').click();
    cy.contains('Username');
  });

});
