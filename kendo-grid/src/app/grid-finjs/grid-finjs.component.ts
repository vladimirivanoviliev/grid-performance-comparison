import { Component, OnDestroy } from '@angular/core';
import { ExcelExportData } from '@progress/kendo-angular-excel-export';
import { GroupDescriptor, SortDescriptor } from '@progress/kendo-data-query';
import { process } from '@progress/kendo-data-query';
import { from, interval, Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { LocalDataService } from './local-data.service';
import {
  changeNegative,
  changePositive,
  negative,
  positive,
  strongNegative,
  strongPositive
} from './local-data/trends';

@Component({
  selector: 'app-grid-finjs',
  providers: [ LocalDataService ],
  templateUrl: './grid-finjs.component.html',
})
export class GridFinJsComponent implements OnDestroy {
  volume = 1000;
  frequency = 500;
  data: Observable<any[]> ;
  group: GroupDescriptor[] = [];
  sort: SortDescriptor[] = [];
  updating = false;

  private dataChanges = new Subject<void>();
  private subscription: Subscription;

  constructor(private localService: LocalDataService) {
    this.localService.resetData(this.volume);
    this.data = this.localService.records;

    this.subscription = this.dataChanges.pipe(
      debounceTime(250)
    ).subscribe(() => this.resetData());
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  trends(dataItem: any) {
    return {
      changeNegative: changeNegative(dataItem),
      changePositive: changePositive(dataItem),
      negative: negative(dataItem),
      positive: positive(dataItem),
      strongNegative: strongNegative(dataItem),
      strongPositive: strongPositive(dataItem)
    };
  }

  onGroupedChange() {
    if (this.group.length > 0) {
      this.group = [];
    } else {
      this.group = [{
        dir: 'desc',
        field: 'Category'
      }, {
        dir: 'desc',
        field: 'Type'
      }, {
        dir: 'desc',
        field: 'Contract'
      }];
    }
  }

  startUpdate() {
    this.updating = true;
    this.data = interval(this.frequency).pipe(
      startWith(this.localService.records),
      switchMap(() => this.localService.records),
      map(data => this.updateRandomPrices(data))
    );
  }

  startUpdateAll() {
    this.updating = true;
    this.data = interval(this.frequency).pipe(
      startWith(this.localService.records),
      switchMap(() => this.localService.records),
      map(data => this.updateAllPrices(data))
    );
  }

  clearData() {
    this.data = from([]);
  }

  dataChange() {
    this.dataChanges.next();
  }

  resetData() {
    this.localService.resetData(this.volume);
    this.data = this.localService.records;
    this.updating = false;
  }

  allData = (): Observable<ExcelExportData> =>
    this.data.pipe(
      map(data => ({
        data: process(data, { group: this.group, sort: this.sort }).data,
        group: this.group
      }))
    )

  private updateAllPrices(data: any[]): any {
    const newData = data.slice();
    for (const dataRow of newData) {
      this.randomizeObjectData(dataRow);
    }

    return newData;
  }

  private updateRandomPrices(data: any[]): any {
    const newData = data.slice();
    for (let i = Math.round(Math.random() * 10); i < newData.length; i += Math.round(Math.random() * 10)) {
      this.randomizeObjectData(newData[i]);
    }
    return newData;
  }

  private randomizeObjectData(dataObj) {
    const changeP = 'Change(%)';
    const res = this.generateNewPrice(dataObj.Price);
    dataObj.Change = res.Price - dataObj.Price;
    dataObj.Price = res.Price;
    dataObj[changeP] = res.ChangePercent;
  }

  private generateNewPrice(oldPrice): any {
    let rnd = Math.random();
    rnd = Math.round(rnd * 100) / 100;
    const volatility = 2;
    let newPrice = 0;
    let changePercent = 2 * volatility * rnd;
    if (changePercent > volatility) {
      changePercent -= (2 * volatility);
    }
    const changeAmount = oldPrice * (changePercent / 100);
    newPrice = oldPrice + changeAmount;
    newPrice = Math.round(newPrice * 100) / 100;
    const result = { Price: 0, ChangePercent: 0 };
    changePercent = Math.round(changePercent * 100) / 100;
    result.Price = newPrice;
    result.ChangePercent = changePercent;

    return result;
  }

}
