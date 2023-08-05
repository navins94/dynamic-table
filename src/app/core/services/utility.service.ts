import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  /* The `formatHeader` function takes a string parameter `item` and formats it to have the first
  letter capitalized and replaces any underscores with spaces. It then returns the formatted string. */
  formatHeader(item: string): string {
    item = item.replace(/_/g, ' ');
    return item.charAt(0).toUpperCase() + item.slice(1);
  }

  /**
   * The function takes an operator code and a list of operators, and returns the corresponding
   * operator name.
   * @param {string} operator - The `operator` parameter is a string that represents the code of an
   * operator.
   * @param {any[]} operatorList - An array of objects containing information about operators. Each
   * object in the array has two properties: "code" and "name". The "code" property represents the code
   * of the operator, and the "name" property represents the name of the operator.
   * @returns the name of the operator that matches the given operator code.
   */
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
