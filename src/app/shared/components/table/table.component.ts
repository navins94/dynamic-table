import {
  Component,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { DataService } from 'src/app/core/services/data.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent {
  @Input() data: any[] = [];
  @Input() columns: { code: string; name: string }[] = [];

  @Output() pageChanged = new EventEmitter<PageEvent>();

  dataSource!: MatTableDataSource<any>;
  displayedColumns!: string[];
  pageIndex!: number;
  pageSize!: number;
  dataLength!: number;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private dataService: DataService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] || changes['columns']) {
      this.initializeTable();
    }
  }

  private initializeTable(): void {
    this.dataLength = this.dataService.dataLengthValue;
    this.pageIndex = this.dataService.currentPageValue;
    this.pageSize = this.dataService.pageSizeValue;
    this.displayedColumns = this.columns.map((column) => column.code);
    this.dataSource = new MatTableDataSource<any>(this.data);
  }

  /**
   * The function `getLinkText` takes a `columnCode` parameter and returns a corresponding link text
   * based on the value of `columnCode`.
   * @param {string} columnCode - The `columnCode` parameter is a string that represents the code for a
   * specific column in a table or data structure.
   * @returns The function `getLinkText` returns a string value. The specific string value that is
   * returned depends on the value of the `columnCode` parameter. If `columnCode` is equal to 'url',
   * the function returns 'Link'. If `columnCode` is equal to 'image', the function returns 'See
   * image'. If `columnCode` is equal to 'image_additional', the function
   */
  getLinkText(columnCode: string): string {
    switch (columnCode) {
      case 'url':
        return 'Link';
      case 'image':
        return 'See image';
      case 'image_additional':
        return 'See additional image';
      case 'source_video':
        return 'Video';
      default:
        return '';
    }
  }

  onPageChange(event: PageEvent) {
    this.pageChanged.emit(event);
  }
}
