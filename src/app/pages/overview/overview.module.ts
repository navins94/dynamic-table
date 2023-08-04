import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverviewComponent } from './overview.component';
import { SidebarComponent } from 'src/app/shared/components/sidebar/sidebar.component';
import { MatSidenavModule } from '@angular/material/sidenav';

@NgModule({
  declarations: [OverviewComponent, SidebarComponent],
  imports: [CommonModule, MatSidenavModule],
  exports: [OverviewComponent],
})
export class OverviewModule {}
