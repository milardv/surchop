export type Person = {
  id: string;
  display_name: string;
  image_url?: string;
  couple_id: string;
};

export type CoupleDoc = {
  people_a_id: string;
  people_b_id: string;
  count_a?: number;
  count_b?: number;
  createdAt?: any;
};

export type CoupleView = {
  id: string;
  a: Person;
  b: Person;
  countA: number;
  countB: number;
};

export type VoteDoc = {
  couple_id: string;
  uid: string;
  people_voted_id: string; // = a.id ou b.id
  updatedAt: any;
};
