describe("visit", () => {
  it("passes", () => {
    cy.visit("/");
    cy.get("[data-testid='settings-trigger']").click();
  });
});