export interface NavItem {
  label: string;
  path: string;
}

export const navItems: NavItem[] = [
  { label: "Rezepte", path: "/rezepte" },
  { label: "Über uns", path: "/about" },
  { label: "Kontakt", path: "/kontakt" },
];

export const legalItems: NavItem[] = [
  { label: "Impressum", path: "/impressum" },
  { label: "Datenschutz", path: "/datenschutz" },
];
