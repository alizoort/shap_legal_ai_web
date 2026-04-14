import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslateModule } from '@ngx-translate/core';
import { LegalAiPageComponent } from './legal-ai/pages/legal-ai.page';
import { LegalAiWorkspaceComponent } from './legal-ai/ui/legal-ai-workspace/legal-ai-workspace.component';
import { SideBarRoutingModule } from './side-bar-routing.module';
import { SideBarComponent } from './side-bar.component';
import { SideBarShellPageComponent } from './shell/pages/side-bar-shell.page';
import { SideNavComponent } from './shell/ui/side-nav/side-nav.component';

@NgModule({
  declarations: [
    SideBarComponent,
    SideBarShellPageComponent,
    SideNavComponent,
    LegalAiPageComponent,
    LegalAiWorkspaceComponent,
  ],
  imports: [
    CommonModule,
    SideBarRoutingModule,
    TranslateModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSlideToggleModule,
  ],
})
export class SideBarModule {}
