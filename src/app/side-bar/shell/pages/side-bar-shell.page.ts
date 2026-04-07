import { computed, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { SideBarShellVm } from '../state/side-bar-shell.vm';

@Component({
  selector: 'app-side-bar-shell-page',
  templateUrl: './side-bar-shell.page.html',
  standalone: false,
})
export class SideBarShellPageComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly panel = toSignal(
    this.activatedRoute.paramMap.pipe(map((params) => params.get('panel') ?? 'legal-ai')),
    { initialValue: 'legal-ai' }
  );

  readonly shellVm = computed<SideBarShellVm>(() => ({
    activePanel: this.panel(),
    navigation: [
      {
        panel: 'legal-ai',
        label: 'Legal AI',
        icon: 'gavel',
      },
    ],
  }));
}
