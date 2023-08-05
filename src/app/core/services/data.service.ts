import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Filter } from 'src/app/core/interfaces/filter.interface';

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
  private totalCountSubject = new BehaviorSubject<number>(0);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.subscribeToRouteParameters();
  }

  subscribeToRouteParameters(): void {
    this.route.queryParams.subscribe((params) => {
      const filters = this.getFiltersFromQueryParams(params);
      this.updatePageDetailsFromQueryParams(params);
      this.filtersSubject.next(filters);
      this.applyAndPaginateData();
    });
  }

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

  updatePageDetailsFromQueryParams(params: any): void {
    this.currentPage =
      params['page'] !== undefined ? Number(params['page']) : 0;
    this.pageSize = params['size'] !== undefined ? Number(params['size']) : 10;
  }

  getDataAndColumns(): Observable<{ data: any[]; columns: string[] }> {
    this.loadingSubject.next(true);
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((data) => {
        const results: any[] = [];
        for (const [key, value] of Object.entries(data)) {
          results.push(value);
        }
        const columns = results.length > 0 ? Object.keys(results[0]) : [];
        const result = { data: results, columns };
        this.dataSubject.next(result);
        this.applyAndPaginateData();
        return result;
      }),
      tap(() => this.loadingSubject.next(false))
    );
  }

  getPaginatedData(page: number, pageSize: number): Observable<any[]> {
    this.currentPage = page;
    this.pageSize = pageSize;
    return this.filteredDataSubject.asObservable();
  }

  setPage(page: number) {
    this.currentPage = page;
  }
  setPageSize(page: number) {
    this.pageSize = page;
  }

  addFilter(filter: Filter) {
    const filters = this.filtersSubject.getValue();
    filters.push(filter);
    this.filtersSubject.next(filters);
    this.updateFiltersInUrl();
  }

  removeFilter(index: number) {
    const filters = this.filtersSubject.getValue();
    filters.splice(index, 1);
    this.filtersSubject.next(filters);
    this.currentPage = 0;
    this.updateFiltersInUrl();
  }

  clearFilters() {
    this.filtersSubject.next([]);
    this.updateFiltersInUrl();
  }

  applyAndPaginateData(): void {
    const filteredData = this.applyFilters();
    console.log(filteredData, 'filteredData');
    this.paginateData(filteredData);
  }

  applyFilters(): any[] {
    const filters = this.filtersSubject.getValue();
    let { data: filteredData } = this.dataSubject.getValue();

    filters.forEach((filter) => {
      filteredData = this.applyFilter(filteredData, filter);
    });

    return filteredData;
  }

  paginateData(data: any[]): void {
    this.totalCountSubject.next(data.length);

    const start = this.currentPage * this.pageSize;
    const paginatedData = data.slice(start, start + this.pageSize);

    this.filteredDataSubject.next(paginatedData);
  }

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

  addFilterParamsToQueryParams(filters: Filter[], queryParams: any): void {
    filters.forEach((filter, index) => {
      queryParams[`column${index}`] = filter.column;
      queryParams[`operator${index}`] = filter.operator;
      queryParams[`value${index}`] = filter.columnValue;
    });
  }

  addPageDetailsToQueryParams(queryParams: any): void {
    if (this.currentPage !== 0) {
      queryParams['page'] = this.currentPage;
      queryParams['size'] = this.pageSize;
    }
  }

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

  get isLoading(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  get activeFilters(): Observable<Filter[]> {
    return this.filtersSubject.asObservable();
  }

  get totalCount(): Observable<number> {
    return this.totalCountSubject.asObservable();
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
}
