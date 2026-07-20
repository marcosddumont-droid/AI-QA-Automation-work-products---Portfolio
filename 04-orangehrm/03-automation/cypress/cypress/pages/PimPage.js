/** Módulo PIM: listado y búsqueda de empleados. */
export class PimPage {
  abrir() {
    cy.visit('/web/index.php/pim/viewEmployeeList');
    cy.esperarCarga();
    return this;
  }

  breadcrumb() {
    return cy.get('.oxd-topbar-header-breadcrumb-module');
  }

  filas() {
    return cy.get('.oxd-table-card');
  }

  encabezados() {
    return cy.get('.oxd-table-header-cell');
  }

  /** Texto tipo "(120) Records Found". */
  contadorDeRegistros() {
    return cy.contains('span', 'Records Found');
  }

  /**
   * Los campos del filtro no tienen name ni id: se ubican por la etiqueta
   * visible y de ahí se sube al contenedor del campo. Es más verboso que un
   * selector directo, pero sobrevive a los cambios de clases generadas.
   */
  campoPorEtiqueta(etiqueta) {
    return cy
      .contains('.oxd-input-group label', etiqueta)
      .closest('.oxd-input-group')
      .find('input');
  }

  botonBuscar() {
    return cy.get('button[type="submit"]').contains('Search').parent();
  }

  botonReset() {
    return cy.contains('button', 'Reset');
  }

  buscarPorId(id) {
    this.campoPorEtiqueta('Employee Id').clear().type(id);
    cy.contains('button', 'Search').click();
    cy.esperarCarga();
    return this;
  }

  buscarPorNombre(nombre) {
    this.campoPorEtiqueta('Employee Name').clear().type(nombre);
    // El autocompletado necesita un momento antes de enviar la búsqueda.
    cy.get('.oxd-autocomplete-dropdown', { timeout: 10_000 }).should('be.visible');
    cy.contains('button', 'Search').click();
    cy.esperarCarga();
    return this;
  }

  mensajeSinResultados() {
    return cy.contains('No Records Found');
  }
}

export const pimPage = new PimPage();
