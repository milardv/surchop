export type Person = {
    id: string;
    display_name: string;
    image_url?: string;
    couple_id: string;
    count?: number;
};

type CoupleCategory = 'people' | 'friends';

export type CoupleDoc = {
    people_a_id: string;
    people_b_id: string;
    count_a?: number;
    count_b?: number;
    createdAt?: any;
    category: CoupleCategory;
};

export type CoupleView = {
    id: string;
    personA: Person;
    personB: Person;
    countA: number;
    countB: number;
    category: CoupleCategory;
};

export type VoteDoc = {
    couple_id: string;
    uid: string;
    people_voted_id: string; // = a.id ou b.id
    updatedAt: any;
};

export type VoteView = VoteDoc & { id: string; updatedAt?: Date };
