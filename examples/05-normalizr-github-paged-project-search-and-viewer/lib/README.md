Github Project Search Example
--------------------------------------------------------
Everything here is simply boilerplate to create a webpack build and set up a redux web application.  See [./search-page](./search-page) and [./project-details-page](./project-details-page) for more details.

Changes from the previous example are

* Added a new [project details page](./project-details-page)
  * Added a route to define this page in the [react router definitions](./index.js)
  * Moved the [schema definition](./project-details-page/schema) to the `project-details-page dir`
* Added a react-router `Link` for each entry in the [search results list](./search-page/search-page.js)
