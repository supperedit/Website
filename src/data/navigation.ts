export interface NavItem {
  label: string;
  path: string;
}

// Single source of truth for the primary site map. The hamburger menu and the
// footer both render from this list so they can't drift into describing two
// different sites (see MenuPopup and Footer).
export const navItems: NavItem[] = [
  { label: "Rezepte", path: "/rezepte" },
  { label: "Herbarium", path: "/journal" },
  { label: "Kitchen Notes", path: "/kitchen-notes" },
  { label: "Über uns", path: "/about" },
  { label: "Kontakt", path: "/kontakt" },
];

export const legalItems: NavItem[] = [
  { label: "Impressum", path: "/impressum" },
  { label: "Datenschutz", path: "/datenschutz" },
];
