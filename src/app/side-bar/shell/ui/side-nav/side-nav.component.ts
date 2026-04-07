import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SideBarNavItem } from '../../state/side-bar-shell.vm';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SideNavComponent {
  @Input({ required: true }) navigation: readonly SideBarNavItem[] = [];
  @Input({ required: true }) activePanel = 'legal-ai';
}
