import { Pipe, PipeTransform } from '@angular/core';
import { UtilityService } from '../services/utility.service';

@Pipe({
  name: 'tableFilter',
})
export class TableFilterPipe implements PipeTransform {
  constructor(private utilityService: UtilityService) {}

  transform(item: any, operatorList: any[]): string {
    const formattedHeader = this.utilityService.formatHeader(item.column);
    const formattedOperator = this.utilityService.formatOperator(
      item.operator,
      operatorList
    );
    return `${formattedHeader} ${formattedOperator} ${item.columnValue}`;
  }
}
