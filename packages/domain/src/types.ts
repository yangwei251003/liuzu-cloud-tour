export type VerificationStatus = 'verified' | 'planning' | 'unverified';

export type SourceKind =
  | 'prototype-reference'
  | 'government-source'
  | 'owned'
  | 'ai-generated'
  | 'local-demo';

export interface SourceRef {
  sourceKind: SourceKind;
  verificationStatus: VerificationStatus;
  sourceLabel?: string;
  sourceUrl?: string;
  checkedAt?: string;
}

export type SourceMetadata = SourceRef;

interface MediaAssetBase extends SourceRef {
  id: string;
  alt: string;
  width?: number;
  height?: number;
}

export type MediaAsset = MediaAssetBase &
  (
    | {
        availability: 'available';
        src: string;
        fallbackText?: never;
      }
    | {
        availability: 'unavailable';
        src?: never;
        fallbackText: string;
      }
  );

export type MediaMetadata = MediaAsset;

export interface Spot {
  id: string;
  name: string;
  area: string;
  summary: string;
  tags: string[];
  location: {
    latitude?: number;
    longitude?: number;
  };
  hero: MediaAsset;
  source: SourceRef;
}

export type Attraction = Spot;

export interface RouteStop {
  id: string;
  spotId: Spot['id'];
  name: string;
  order: number;
  note?: string;
}

interface RouteBase {
  id: string;
  name: string;
  duration: string;
  summary: string;
  source: SourceRef;
}

export interface Route extends RouteBase {
  stops: RouteStop[];
}

export interface TourRoute extends RouteBase {
  stopIds: Spot['id'][];
  stops?: RouteStop[];
}

export type AchievementType =
  | 'party-building'
  | 'livestream'
  | 'interview'
  | 'survey'
  | 'aigc';

export interface Achievement {
  id: string;
  type: AchievementType;
  title: string;
  summary: string;
  source: SourceRef;
}

export interface Stamp {
  id: string;
  spotId: Spot['id'];
  name: string;
  media?: MediaAsset;
  unlockedAt?: string;
  source: SourceRef;
}
