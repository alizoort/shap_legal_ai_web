import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SideBarNavItem } from './shell/state/side-bar-shell.vm';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SideBarComponent {
  @Input({ required: true }) navigation: readonly SideBarNavItem[] = [];
  @Input({ required: true }) activePanel = 'legal-ai';
}
