import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Filter {
  column: string;
  operator: string;
  columnValue: any;
}

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

  private currentPage = 1;
  private pageSize = 10;
  private totalCountSubject = new BehaviorSubject<number>(0);

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.queryParams.subscribe((params) => {
      const filters: Filter[] = [];

      for (let i = 0; ; i++) {
        const column = params[`column${i}`];
        const operator = params[`operator${i}`];
        const value = params[`value${i}`];

        if (column && operator && value) {
          filters.push({ column, operator, columnValue: value });
        } else {
          break;
        }
      }

      if (filters.length > 0) {
        this.filtersSubject.next(filters);
        this.applyFilters();
      }
    });
  }

  getDataAndColumns(): Observable<{ data: any[]; columns: string[] }> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((data) => {
        const results: any[] = [];
        for (const [key, value] of Object.entries(data)) {
          results.push(value);
        }
        const columns = results.length > 0 ? Object.keys(results[0]) : [];
        const result = { data: results, columns };
        this.dataSubject.next(result);
        this.applyFilters();
        return result;
      })
    );
  }

  getPaginatedData(page: number, pageSize: number): Observable<any[]> {
    this.currentPage = page;
    this.pageSize = pageSize;
    this.applyFilters();
    return this.filteredDataSubject.asObservable();
  }

  get activeFilters(): Observable<Filter[]> {
    return this.filtersSubject.asObservable();
  }

  setPage(page: number) {
    this.currentPage = page;
  }
  setPageSize(page: number) {
    this.pageSize = page;
  }

  updateFiltersInUrl() {
    const filters = this.filtersSubject.getValue();
    const queryParams: any = { ...this.route.snapshot.queryParams };

    Object.keys(queryParams).forEach((key) => {
      if (
        key.startsWith('column') ||
        key.startsWith('operator') ||
        key.startsWith('value')
      ) {
        delete queryParams[key];
      }
    });

    filters.forEach((filter, index) => {
      queryParams[`column${index}`] = filter.column;
      queryParams[`operator${index}`] = filter.operator;
      queryParams[`value${index}`] = filter.columnValue;
    });

    queryParams['pageIndex'] = this.currentPage;
    queryParams['pageSize'] = this.pageSize;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
    });
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
    this.applyFilters();
    this.updateFiltersInUrl();
  }

  get filteredData(): Observable<any[]> {
    return this.filteredDataSubject.asObservable();
  }

  applyFilters() {
    const filters = this.filtersSubject.getValue();
    let { data: filteredData } = this.dataSubject.getValue();

    filters.forEach((filter) => {
      filteredData = filteredData.filter((item) => {
        switch (filter.operator) {
          case 'eq':
            return item[filter.column] == filter.columnValue;
          case 'neq':
            return item[filter.column] !== filter.columnValue;
          case 'lte':
            return item[filter.column] <= filter.columnValue;
          case 'gte':
            return item[filter.column] >= filter.columnValue;
          case 'ctn':
            return item[filter.column].includes(filter.columnValue);
          case 'nctn':
            return !item[filter.column].includes(filter.columnValue);
          default:
            return true;
        }
      });
    });
    console.log(filteredData, 'filtersfilters');
    this.totalCountSubject.next(filteredData.length);

    const start = (this.currentPage - 1) * this.pageSize;
    const paginatedData = filteredData.slice(start, start + this.pageSize);
    this.filteredDataSubject.next(paginatedData);
  }

  get totalCount(): Observable<number> {
    return this.totalCountSubject.asObservable();
  }

  clearFilters() {
    this.filtersSubject.next([]);
    this.applyFilters();
    this.updateFiltersInUrl();
  }
}
