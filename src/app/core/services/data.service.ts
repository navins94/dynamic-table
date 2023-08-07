import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  Filter,
  DataAndColumns,
} from 'src/app/core/interfaces/filter.interface';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private apiUrl = 'assets/table_data.json';
  private filtersSubject = new BehaviorSubject<Filter[]>([]);
  private dataSubject = new BehaviorSubject<{ data: any[]; columns: string[] }>(
    { data: [], columns: [] }
  );
  private filteredDataSubject = new BehaviorSubject<any[]>([]);

  private currentPage = 0;
  private pageSize = 10;
  private dataLength = 0;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.subscribeToRouteParameters();
  }

  /**
   * The function subscribes to changes in the route's query parameters, extracts filters from the
   * parameters, updates page details based on the parameters, and emits the filters to a subject.
   */
  subscribeToRouteParameters(): void {
    this.route.queryParams.subscribe((params) => {
      const filters = this.getFiltersFromQueryParams(params);
      this.updatePageDetailsFromQueryParams(params);
      this.filtersSubject.next(filters);
    });
  }

  /**
   * The function `getFiltersFromQueryParams` takes in query parameters and returns an array of filters
   * based on those parameters.
   * @param {any} params - The `params` parameter is an object that contains query parameters.
   * @returns an array of Filter objects.
   */
  getFiltersFromQueryParams(params: any): Filter[] {
    const filters: Filter[] = [];
    let i = 0;

    while (
      params[`column${i}`] &&
      params[`operator${i}`] &&
      params[`value${i}`]
    ) {
      const column = params[`column${i}`];
      const operator = params[`operator${i}`];
      const value = params[`value${i}`];

      filters.push({ column, operator, columnValue: value });
      i++;
    }

    return filters;
  }

  /**
   * The function updates the page details based on the query parameters, such as the current page
   * number and page size.
   * @param {any} params - The `params` parameter is an object that contains query parameters.
   */
  updatePageDetailsFromQueryParams(params: any): void {
    this.currentPage =
      params['page'] !== undefined ? Number(params['page']) : 0;
    this.pageSize = params['size'] !== undefined ? Number(params['size']) : 10;
  }

  /**
   * The function retrieves data from an API, maps the response to a specific format, and emits the data
   * while applying pagination.
   * @returns The function `getDataAndColumns()` returns an Observable of type `DataAndColumns`.
   */
  getDataAndColumns(): Observable<DataAndColumns> {
    return this.http.get<Record<string, unknown>[]>(this.apiUrl).pipe(
      map((responseData): DataAndColumns => {
        const results: Record<string, unknown>[] = Object.values(responseData);
        const columns = results.length > 0 ? Object.keys(results[0]) : [];
        return { data: results, columns };
      }),
      tap((result) => {
        this.emitData(result);
        this.applyAndPaginateData();
      })
    );
  }

  private emitData(dataAndColumns: DataAndColumns): void {
    this.dataSubject.next(dataAndColumns);
  }

  setPage(page: number) {
    this.currentPage = page;
  }

  setPageSize(page: number) {
    this.pageSize = page;
  }

  /**
   * The addFilter function adds a filter to the list of filters, updates the current page to 0, and
   * updates the filters in the URL.
   * @param {Filter} filter - The "filter" parameter is an object of type "Filter". It represents a
   * filter that will be added to a list of filters.
   */
  addFilter(filter: Filter) {
    const filters = this.filtersSubject.getValue();
    const filterExists = filters.some(
      (existingFilter) =>
        existingFilter.column === filter.column &&
        existingFilter.operator === filter.operator &&
        existingFilter.columnValue === filter.columnValue
    );
    if (filterExists) {
      window.alert('The same filter already exists!');
      return;
    }
    filters.push(filter);
    this.filtersSubject.next(filters);
    this.currentPage = 0;
    this.applyAndPaginateData();
    this.updateFiltersInUrl();
  }

  /**
   * The `removeFilter` function removes a filter at a specific index from an array, updates the array,
   * resets the current page to 0, and updates the filters in the URL.
   * @param {number} index - The index parameter is the position of the filter that needs to be removed
   * from the filters array.
   */
  removeFilter(index: number) {
    const filters = this.filtersSubject.getValue();
    filters.splice(index, 1);
    this.filtersSubject.next(filters);
    this.currentPage = 0;
    this.applyAndPaginateData();
    this.updateFiltersInUrl();
  }

  /**
   * The clearFilters function clears the filters by updating the filters subject and updating the
   * filters in the URL.
   */
  clearFilters() {
    this.filtersSubject.next([]);
    this.currentPage = 0;
    this.applyAndPaginateData();
    this.updateFiltersInUrl();
  }

  /**
   * The function applies filters to data and then paginates the filtered data.
   */
  applyAndPaginateData(): void {
    const filteredData = this.applyFilters();
    this.paginateData(filteredData);
  }

  /**
   * The function applies a series of filters to a dataset and returns the filtered data.
   * @returns The filteredData array is being returned.
   */
  applyFilters(): any[] {
    const filters = this.filtersSubject.getValue();
    let { data: filteredData } = this.dataSubject.getValue();

    filters.forEach((filter) => {
      filteredData = this.applyFilter(filteredData, filter);
    });

    return filteredData;
  }

  /**
   * The `paginateData` function takes an array of data, calculates the start and end indices for
   * pagination based on the current page and page size, and emits the paginated data to a subject.
   * @param {any[]} data - The `data` parameter is an array of any type of data.
   */
  paginateData(data: any[]): void {
    this.dataLength = data.length;
    const start = this.currentPage * this.pageSize;
    const paginatedData = data.slice(start, start + this.pageSize);

    this.filteredDataSubject.next(paginatedData);
  }

  /**
   * The function applies a filter to an array of data based on the specified filter conditions.
   * @param {any[]} data - The `data` parameter is an array of objects. Each object represents a data
   * item that you want to filter.
   * @param {Filter} filter - The `filter` parameter is an object that contains the following
   * properties:
   * @returns The function `applyFilter` returns an array of filtered items based on the provided filter
   * criteria.
   */
  applyFilter(data: any[], filter: Filter): any[] {
    return data.filter((item) => {
      switch (filter.operator) {
        case 'eq':
          return item[filter.column] == filter.columnValue;
        case 'neq':
          return item[filter.column] != filter.columnValue;
        case 'lte':
          return item[filter.column] <= filter.columnValue;
        case 'gte':
          return item[filter.column] >= filter.columnValue;
        case 'ctn':
          return (item[filter.column] + '').indexOf(filter.columnValue) !== -1;
        case 'nctn':
          return (item[filter.column] + '').indexOf(filter.columnValue) === -1;
        default:
          return true;
      }
    });
  }

  /**
   * The function updates the filters in the URL by removing existing filter parameters, adding new
   * filter parameters, and adding page details to the query parameters.
   */
  updateFiltersInUrl(): void {
    const filters = this.filtersSubject.getValue();
    const queryParams = this.removeExistingFilterParamsFromQueryParams();

    this.addFilterParamsToQueryParams(filters, queryParams);
    this.addPageDetailsToQueryParams(queryParams);

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
    });
  }

  /**
   * The function adds filter parameters to query parameters in TypeScript.
   * @param {Filter[]} filters - An array of objects representing the filters to be applied to the
   * query. Each object in the array should have the following properties:
   * @param {any} queryParams - An object representing the query parameters that will be sent in a
   * request.
   */
  addFilterParamsToQueryParams(filters: Filter[], queryParams: any): void {
    filters.forEach((filter, index) => {
      queryParams[`column${index}`] = filter.column;
      queryParams[`operator${index}`] = filter.operator;
      queryParams[`value${index}`] = filter.columnValue;
    });
  }

  /**
   * The function adds page details (current page and page size) to the query parameters.
   * @param {any} queryParams - The `queryParams` parameter is an object that represents the query
   * parameters of a URL. It typically contains key-value pairs where the key represents the parameter
   * name and the value represents the parameter value.
   */
  addPageDetailsToQueryParams(queryParams: any): void {
    if (this.currentPage !== 0) {
      queryParams['page'] = this.currentPage;
    }
    if (this.pageSize !== 10) {
      queryParams['size'] = this.pageSize;
    }
  }

  /**
   * The function removes specific filter parameters from the query parameters object.
   * @returns the modified `queryParams` object after removing certain keys.
   */
  removeExistingFilterParamsFromQueryParams(): any {
    const queryParams: any = { ...this.route.snapshot.queryParams };

    Object.keys(queryParams).forEach((key) => {
      if (
        key.startsWith('column') ||
        key.startsWith('operator') ||
        key.startsWith('value') ||
        key === 'page' ||
        key === 'size'
      ) {
        delete queryParams[key];
      }
    });

    return queryParams;
  }

  get activeFilters(): Observable<Filter[]> {
    return this.filtersSubject.asObservable();
  }

  get filteredData(): Observable<any[]> {
    return this.filteredDataSubject.asObservable();
  }

  get currentPageValue(): number {
    return this.currentPage;
  }

  get pageSizeValue(): number {
    return this.pageSize;
  }

  get dataLengthValue(): number {
    return this.dataLength;
  }
}
