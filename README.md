# Dynamic Data Table

This application showcases a data table using Angular and Angular Material. It fetches JSON data, displays it in a table, and provides features like pagination and filtering.

## Features

- **Dynamic columns**: The application does not assume a fixed structure for the incoming data, it determines the table columns based on the keys of the JSON objects.
- **Pagination**: The Angular Material Paginator is used to allow for browsing through the data page by page.
- **Filtering**: Each column of data can have filters applied, which are reflected in the URL for shareability.
- **Link formatting**: Certain keys are treated as links and are displayed as such in the data table.

## Approach

1. We created an Angular service `DataService` that handles data fetching, pagination, filtering, and synchronization with URL query parameters.
2. The Angular component `OverviewComponent` subscribes to data updates from `DataService` and displays the data in an Angular Material table.
3. We used Angular's Router and ActivatedRoute to manage the application's state in the URL. This allows for direct linking to a specific set of filters and page. We added this so that user can easily bookmark page and open again with filtering
4. The table's structure and the way cells are displayed are dynamically generated based on the data received. This includes handling specific keys as URLs.

## External Dependencies

- **Angular Material**: Angular Material provides a set of reusable and accessible UI components based on Material Design. We used it to create a table, paginator, and spinner in this project.
- **RxJS**: RxJS is a library for composing asynchronous and event-based programs by using observable sequences. It's used extensively in Angular applications, and here it's used for handling asynchronous data and event streams.

## Development server

This application is created using Angular CLI version 16.1.6.

To serve the application locally, run:

```bash
ng serve
```

Then navigate to `http://localhost:4200/` in your browser.

## Possible Improvements

1. **Error Handling**: Right now, the application doesn't handle errors from the HTTP request. In the future, we could add error handling and user notifications for such events.
2. **Column Visibility Toggle**: As we are unsure how many columns will be there better approach would be to add coloum toggle so that we can show only selected column data
3. **Better Form Validation**: We can improve form validation ex - checking if same filter is already added or not
4. **Better interfaces**: We can add proper interfaces
5. **Better pagination**: We can improve the pagination UI/UX by providing numbers instead of prev, next page
6. **Additional Functionality**: Features like sorting and multi-filtering on the same column could be added.
7. **Responsiveness**: Make the application responsive for various screen sizes and devices.
8. **Accessibility**: Ensure the application meets accessibility standards to cater to all users, including those with disabilities.
9. **Testing**: The application currently lacks automated tests. Adding unit and end-to-end tests would ensure that the application behaves as expected as new features are added or changes are made.
10. **Review the codebase**: for any areas of improvement, code duplication, or optimization opportunities.
