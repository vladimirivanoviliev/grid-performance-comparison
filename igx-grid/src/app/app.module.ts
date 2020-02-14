import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { IgxGridModule, IgxExcelExporterService, IgxCheckboxModule, IgxButtonModule, IgxSwitchModule, IgxSliderModule } from 'igniteui-angular';

import { AppComponent } from './app.component';
import { GridFinJsComponent } from './grid-finjs/grid-finjs.component';

@NgModule({
  declarations: [
    AppComponent,
    GridFinJsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IgxGridModule,
    IgxCheckboxModule,
    IgxButtonModule,
    IgxSwitchModule,
    IgxSliderModule,
    FormsModule
  ],
  providers: [IgxExcelExporterService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
