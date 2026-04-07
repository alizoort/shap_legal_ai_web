import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';

const ALLOWED_PANELS = new Set(['legal-ai']);

@Injectable({ providedIn: 'root' })
export class PanelPermissionGuard implements CanActivate {
  constructor(private readonly router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const panel = route.paramMap.get('panel');
    if (panel && ALLOWED_PANELS.has(panel)) {
      return true;
    }

    return this.router.parseUrl('/sideBar/legal-ai');
  }
}
