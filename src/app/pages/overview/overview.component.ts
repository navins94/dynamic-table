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

  headersToObject(headers: string[]): OperatorsInterface[] {
    return headers.map((header) => {
      return {
        code: header,
        name: this.utilityService.formatHeader(header),
      };
    });
  }

  changePage(event: PageEvent) {
    this.dataService.setPage(event.pageIndex);
    this.dataService.setPageSize(event.pageSize);
    this.dataService.updateFiltersInUrl();

    this.dataService
      .getPaginatedData(event.pageIndex, event.pageSize)
      .pipe(takeUntil(this.onDestroy))
      .subscribe((data) => (this.results = data));
  }

  removeFilter(index: number) {
    this.dataService.removeFilter(index);
  }
}
