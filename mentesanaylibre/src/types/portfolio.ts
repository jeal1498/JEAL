import { LucideIcon } from 'lucide-react';

export interface Service {
  slug: string;
  icon: LucideIcon;
  label: string;
  title: string;
  age: string;
  desc: string;
  problem?: string;
  transformation?: { before: string; after: string };
  differentiator?: string;
  process?: string[];
  deliverable?: string;
  price: string;
  tests: string[];
  cta: string;
  color: string;
  borderHover: string;
}

export interface BuyerPersona {
  profile: string;
  trigger: string;
  history: string;
  mainFear: string;
  realQuestion: string;
}

export interface Credential {
  icon: LucideIcon;
  text: string;
}

export interface Review {
  name: string;
  text: string;
  stars: number;
  service: string;
}

export interface FaqItem {
  q: string;
  a: string;
}
