import { Component, Input, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { OperatorsInterface } from 'src/app/core/interfaces/operators.interface';
import { DataService, Filter } from 'src/app/core/services/data.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SidebarComponent {
  @Input() columns: { name: string; code: string }[] = [];
  @Input() operators: OperatorsInterface[] = [];
  hasFilters: boolean = false;

  constructor(private dataService: DataService) {
    this.dataService.activeFilters.subscribe((filters) => {
      this.hasFilters = filters.length > 0;
    });
  }

  filterForm = new FormGroup({
    column: new FormControl('', [Validators.required]),
    columnValue: new FormControl('', Validators.required),
    operator: new FormControl('', Validators.required),
  });

  onApply() {
    const filterValue: Filter = {
      column: this.filterForm.value.column!,
      operator: this.filterForm.value.operator!,
      columnValue: this.filterForm.value.columnValue,
    };
    this.dataService.addFilter(filterValue);
  }

  clearFilters() {
    this.dataService.clearFilters();
  }
}
