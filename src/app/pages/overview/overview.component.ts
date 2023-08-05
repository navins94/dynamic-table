import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataService } from 'src/app/core/services/data.service';
import { UtilityService } from 'src/app/core/services/utility.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { OperatorsInterface } from 'src/app/core/interfaces/operators.interface';
import { PageEvent } from '@angular/material/paginator';
import { Filter } from 'src/app/core/interfaces/filter.interface';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit, OnDestroy {
  private readonly onDestroy = new Subject<void>();

  results: any[] = [];
  columns: any[] = [];
  filteredResults: any[] = [];
  filters$!: Observable<Filter[]>;
  loading = false;

  totalNumberOfResults: number = 0;

  filterForm = new FormGroup({
    column: new FormControl('', [Validators.required]),
    columnValue: new FormControl('', Validators.required),
    operator: new FormControl('', Validators.required),
  });

  operators: OperatorsInterface[] = [
    {
      code: 'lte',
      name: 'Less than or equal to',
    },
    {
      code: 'gte',
      name: 'Greater than or equal to',
    },
    {
      code: 'eq',
      name: 'Equals',
    },
    {
      code: 'neq',
      name: 'Does not equal',
    },
    {
      code: 'ctn',
      name: 'Contains',
    },
    {
      code: 'nctn',
      name: 'Does not contain',
    },
  ];

  constructor(
    private dataService: DataService,
    private utilityService: UtilityService
  ) {
    this.filters$ = dataService.activeFilters;
  }

  ngOnInit() {
    this.loadDataAndColumns();
    this.subscribeToFilteredData();
    this.subscribeToTotalCount();
    this.subscribeToLoadingState();
  }

  ngOnDestroy(): void {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  private loadDataAndColumns(): void {
    this.dataService
      .getDataAndColumns()
      .pipe(takeUntil(this.onDestroy))
      .subscribe(({ data, columns }) => {
        this.results = data;
        this.columns = this.headersToObject(columns);
      });
  }

  private subscribeToFilteredData(): void {
    this.dataService.filteredData
      .pipe(takeUntil(this.onDestroy))
      .subscribe((filteredData) => {
        this.filteredResults = filteredData;
      });
  }

  private subscribeToTotalCount(): void {
    this.dataService.totalCount
      .pipe(takeUntil(this.onDestroy))
      .subscribe((count) => {
        this.totalNumberOfResults = count;
      });
  }

  private subscribeToLoadingState(): void {
    this.dataService.isLoading
      .pipe(takeUntil(this.onDestroy))
      .subscribe((isLoading) => {
        this.loading = isLoading;
      });
  }

  /**
   * The function "headersToObject" takes an array of strings representing headers and returns an array
   * of objects with "code" and "name" properties, where the "name" property is formatted using a
   * utility service.
   * @param {string[]} headers - An array of strings representing headers.
   * @returns an array of objects of type OperatorsInterface.
   */
  headersToObject(headers: string[]): OperatorsInterface[] {
    return headers.map((header) => {
      return {
        code: header,
        name: this.utilityService.formatHeader(header),
      };
    });
  }

  /**
   * The function "changePage" updates the page index and page size in the data service, updates the
   * filters in the URL, and retrieves paginated data based on the updated page index and page size.
   * @param {PageEvent} event - The event parameter is of type PageEvent. It contains information about
   * the page index and page size that triggered the changePage event.
   */
  changePage(event: PageEvent) {
    this.dataService.setPage(event.pageIndex);
    this.dataService.setPageSize(event.pageSize);
    this.dataService.updateFiltersInUrl();

    this.dataService
      .getPaginatedData(event.pageIndex, event.pageSize)
      .pipe(takeUntil(this.onDestroy))
      .subscribe((data) => (this.results = data));
  }

  /**
   * The removeFilter function removes a filter from the data service based on the given index.
   * @param {number} index - The index parameter is a number that represents the position of the filter
   * in an array or list.
   */
  removeFilter(index: number) {
    this.dataService.removeFilter(index);
  }
}
