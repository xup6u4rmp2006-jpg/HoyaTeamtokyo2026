
export type TabType = 'checklist' | 'itinerary' | 'booking' | 'wallet' | 'mission' | 'raffle' | 'game';

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  payer: string;
  participants: string[];
  date: Date;
}

export interface ItineraryItem {
  time: string;
  title: string;
  description?: string;
  address?: string;
  image?: string;
  link?: string;
  color?: string; 
  stayDates?: { from: string; to: string };
  rentalDetails?: {
    pickupTime: string;
    dropoffTime: string;
    dropoffAddress: string;
    dropoffLink?: string;
    cars: { name: string; image: string; capacity: string }[];
  };
  type: 'flight' | 'stay' | 'transport' | 'food' | 'spot' | 'onsen' | 'shopping' | 'shrine' | 'car';
}

export interface DayPlan {
  day: number;
  date: string;
  title: string;
  weather?: {
    temp: string;
    condition: string;
    icon: string;
  };
  clothing?: string;
  items: ItineraryItem[];
}

export interface Stamp {
  id: string;
  name: string;
  icon: string;
  unlocked: boolean;
}

export interface PhotoChallenge {
  id: string;
  name: string;
  icon: string;
  unlocked: boolean;
}
