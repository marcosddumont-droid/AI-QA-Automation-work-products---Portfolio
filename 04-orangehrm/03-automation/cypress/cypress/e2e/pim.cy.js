import { pimPage } from '../pages/PimPage.js';

describe('PIM · Listado de empleados', () => {
  beforeEach(() => {
    // La sesión se cachea con cy.session: solo el primer test paga el login.
    cy.iniciarSesion();
    pimPage.abrir();
  });

  it('TC-20 el listado muestra empleados y el total de registros @smoke', () => {
    pimPage.breadcrumb().should('contain.text', 'PIM');
    pimPage.filas().should('have.length.greaterThan', 0);
    // `should('match', ...)` sobre un elemento compara SELECTORES CSS, no texto.
    // Para afirmar sobre el contenido hay que extraerlo primero con invoke('text').
    pimPage.contadorDeRegistros().invoke('text').should('match', /\(\d+\) Records Found/);
  });

  it('TC-21 la tabla expone las columnas esperadas @regression', () => {
    const columnas = ['Id', 'First (& Middle) Name', 'Last Name', 'Job Title', 'Sub Unit'];

    pimPage.encabezados().then(($th) => {
      const textos = [...$th].map((th) => th.innerText);
      columnas.forEach((columna) => {
        expect(textos.join(' | ')).to.include(columna);
      });
    });
  });

  it('TC-22 buscar por un Employee Id inexistente no devuelve resultados @regression', () => {
    pimPage.buscarPorId('99999999');

    pimPage.mensajeSinResultados().should('be.visible');
  });

  it('TC-23 el filtro reduce la cantidad de resultados @regression', () => {
    // Cantidad inicial, sin filtros.
    pimPage.filas().its('length').as('totalInicial');

    cy.get('@totalInicial').then((totalInicial) => {
      pimPage.buscarPorId('0001');

      cy.get('body').then(($body) => {
        if ($body.text().includes('No Records Found')) {
          // Resultado válido: el filtro se aplicó y no hubo coincidencias.
          expect($body.text()).to.include('No Records Found');
        } else {
          pimPage.filas().its('length').should('be.lessThan', totalInicial);
        }
      });
    });
  });

  it('TC-24 Reset limpia los filtros y restaura el listado @regression', () => {
    pimPage.filas().its('length').then((totalInicial) => {
      pimPage.buscarPorId('99999999');
      pimPage.mensajeSinResultados().should('be.visible');

      pimPage.botonReset().click();
      cy.esperarCarga();

      pimPage.filas().should('have.length', totalInicial);
    });
  });

  it('TC-25 la paginación permite avanzar de página @regression', () => {
    cy.get('body').then(($body) => {
      if ($body.find('.oxd-pagination').length === 0) {
        // Sin paginación no hay nada que verificar: el caso no aplica.
        cy.log('El listado no está paginado en este entorno');
        return;
      }

      cy.get('.oxd-pagination-page-item').contains('2').click();
      cy.esperarCarga();
      pimPage.filas().should('have.length.greaterThan', 0);
    });
  });
});

describe('Navegación entre módulos', () => {
  beforeEach(() => {
    cy.iniciarSesion();
  });

  const modulos = [
    { nombre: 'Admin', urlEsperada: '/admin/viewSystemUsers' },
    { nombre: 'PIM', urlEsperada: '/pim/viewEmployeeList' },
    { nombre: 'Leave', urlEsperada: '/leave/viewLeaveList' },
    { nombre: 'Time', urlEsperada: '/time/viewEmployeeTimesheet' },
  ];

  modulos.forEach(({ nombre, urlEsperada }) => {
    it(`TC-30 el módulo ${nombre} es accesible desde el menú @regression`, () => {
      cy.visit('/web/index.php/dashboard/index');
      cy.get('.oxd-main-menu-item').contains(nombre).click();

      cy.url().should('include', urlEsperada);
      cy.get('.oxd-topbar-header-breadcrumb-module').should('contain.text', nombre);
    });
  });
});
