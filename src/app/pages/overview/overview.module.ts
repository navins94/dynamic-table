import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverviewComponent } from './overview.component';
import { SidebarComponent } from 'src/app/shared/components/sidebar/sidebar.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { TableModule } from 'src/app/shared/components/table/table.module';
import { TableFilterPipe } from 'src/app/core/pipes/tableFilter.pipe';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [OverviewComponent, SidebarComponent, TableFilterPipe],
  imports: [
    CommonModule,
    TableModule,
    HttpClientModule,
    MatSidenavModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
  ],
  exports: [OverviewComponent],
})
export class OverviewModule {}
