import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  formatHeader(item: string): string {
    item = item.replace(/_/g, ' ');
    return item.charAt(0).toUpperCase() + item.slice(1);
  }

  formatOperator(operator: string, operatorList: any[]): string {
    let operatorName: string = '';
    operatorList.forEach((filterOperator) => {
      if (filterOperator.code === operator) {
        operatorName = filterOperator.name;
      }
    });
    return operatorName;
  }
}
