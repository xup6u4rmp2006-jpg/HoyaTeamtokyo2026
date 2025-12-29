export type TabType = 'checklist' | 'itinerary' | 'booking' | 'wallet' | 'mission' | 'raffle' | 'game' | 'achievement';

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

export interface FlightInfo {
  id: 'outbound' | 'inbound';
  typeLabel: string;
  flightNo: string;
  airline: string;
  date: string;
  depTime: string;
  depPort: string;
  arrTime: string;
  arrPort: string;
  carryOnWeight: string;
  checkedWeight: string;
  isNextDay?: boolean;
}

export interface ItineraryItem {
  time: string;
  title: string;
  description?: string;
  address?: string;
  image?: string;
  images?: string[]; 
  link?: string;
  color?: string; 
  isPinned?: boolean; // 新增置頂屬性
  descColor?: 'grey' | 'red'; // 新增描述顏色屬性
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