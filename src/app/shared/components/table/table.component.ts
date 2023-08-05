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
import { UtilityService } from 'src/app/core/services/utility.service';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent {
  @Input() data: any[] = [];
  @Input() columns: { code: string; name: string }[] = [];

  @Input() totalNumberOfResults: number = 0;
  @Input() pageSize: number = 10;
  @Input() pageIndex: number = 0;

  @Output() pageChanged = new EventEmitter<PageEvent>();

  dataSource!: MatTableDataSource<any>;
  displayedColumns!: string[];
  dataLength: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private utilityService: UtilityService) {}

  ngOnInit(): void {
    this.dataLength = this.data && this.data.length ? this.data.length : 0;
    this.updatePaginator();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] || changes['columns']) {
      this.displayedColumns = this.columns.map((column) => column.code);
      this.dataSource = new MatTableDataSource<any>(this.data);
    }
    if (this.paginator) {
      this.updatePaginator();
    }
  }

  private updatePaginator(): void {
    if (this.paginator) {
      this.paginator.length = this.totalNumberOfResults;
      this.paginator.pageSize = this.pageSize;
      this.paginator.pageIndex = this.pageIndex;
    }
  }

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
