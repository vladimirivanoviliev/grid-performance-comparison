import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { GridModule, ExcelModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
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
    FormsModule,
    ButtonsModule,
    GridModule,
    ExcelModule,
    InputsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
