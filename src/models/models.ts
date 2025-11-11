export type Person = {
    id: string;
    display_name: string;
    couple_id: string;
    image_url?: string;
    count?: number;
};

type CoupleCategory = 'people' | 'friends';

export type Couple = {
    id: string;
    people_a_id: string;
    people_b_id: string;
    count_a?: number;
    count_b?: number;
    count_tie: number;
    createdAt?: any;
    category: CoupleCategory;
    validated: boolean;
    isFictional: boolean;
    personA?: Person;
    personB?: Person;
};

export type VoteDoc = {
    id: string;
    couple_id: string;
    uid: string;
    people_voted_id: string; // = a.id ou b.id
    updatedAt: any;
};

export type VoteView = VoteDoc & { id: string; updatedAt?: Date };
