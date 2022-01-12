
describe('Search', () => {
    beforeEach(() => {
        cy.visit('/');
    });
    it('For books by Douglas Adams', () => {
        cy.get('select').select('inauthor');
        cy.get('input').type('Douglas Adams{enter}');

        cy.contains('.card-title', "The Hitchhiker's Guide to the Galaxy").should('be.visible')

    })
    it('Intercept with StringMatcher', () => {
        cy.intercept('/books/v1/volumes?*')
            .as('book-search')
        cy.get('select').select('inauthor');
        cy.get('input').type('Douglas Adams{enter}');

        cy.contains('.card-title', "The Hitchhiker's Guide to the Galaxy").should('be.visible')

    })
    it('Intercept with RouteMatcher', () => {
        cy.intercept({
            hostname: 'www.googleapis.com',
            pathname: '/books/v1/volumes*',
            method: 'get'
        })
            .as('book-search')
        cy.get('select').select('inauthor');
        cy.get('input').type('Douglas Adams{enter}');

        cy.contains('.card-title', "The Hitchhiker's Guide to the Galaxy").should('be.visible')
    })

    it('wait fetch', () => {
        cy.intercept('/books/v1/volumes?*')
            .as('book-search')
        cy.get('select').select('inauthor');
        cy.get('input').type('Douglas Adams{enter}');
        cy.wait('@book-search')
        cy.contains('.card-title', "The Hitchhiker's Guide to the Galaxy").should('be.visible')

    })
    it('fake response', () => {
        cy.intercept('/books/v1/volumes?*', { fixture: 'response.json' })
            .as('book-search')
        cy.get('select').select('inauthor');
        cy.get('input').type('Douglas Adams{enter}');
        cy.wait('@book-search')
        cy.contains('.card-title', "The Hitchhiker's Guide to the Galaxy").should('be.visible')

    })
    it('using response', () => {
        cy.intercept('/books/v1/volumes?*')
            .as('book-search')
        cy.get('select').select('inauthor');
        cy.get('input').type('Douglas Adams{enter}');
        cy.wait('@book-search').then((xhr) => {
            const books = xhr.response.body.items;
            books.forEach((book,index) => {
                cy.get('.card')
                    .eq(index)
                    .within(()=>{
                        cy.get('.card-title').should('have.text', book.volumeInfo.title)
                        cy.get('.card-author').should('have.text', book.volumeInfo.authors.join(', '))
                    })
            })
            
        })
        cy.contains('.card-title', "The Hitchhiker's Guide to the Galaxy").should('be.visible')

    })
    it('to search by Douglas Adams', () => {
        cy.request("https://www.googleapis.com/books/v1/volumes?q=inauthor:Douglas+Adams&maxResults=25&langRestrict=en")
            .as('response')

        cy.get('@response').its('body.kind').should('equal',"books#volumes")
        cy.get('@response').its('body.items').should('have.length', 25)
        cy.get('@response').its('body.totalItems').should('be.greaterThan',350)
        cy.get('@response').its('body.items.0.volumeInfo.title').should('exist')
        cy.get('@response').its('body.items.0.volumeInfo.authors').should('exist')
    })
})