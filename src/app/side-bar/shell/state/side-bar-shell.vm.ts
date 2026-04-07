export interface SideBarNavItem {
  panel: 'legal-ai';
  label: string;
  icon: string;
}

export interface SideBarShellVm {
  activePanel: string;
  navigation: readonly SideBarNavItem[];
}
