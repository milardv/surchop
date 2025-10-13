import React from "react";
import {User} from "firebase/auth";
import {CoupleView, VoteView} from "../models/models";
import CoupleCard from "../components/CoupleCard";


export default function HomePage({
                                     user,
                                     couples,
                                     myVotes,
                                     onVote,
                                     loading,
                                     votesAll,
                                 }: {
    user: User | null;
    couples: CoupleView[];
    myVotes: Record<string, "A" | "B">;
    onVote: (c: CoupleView, choice: "A" | "B") => void;
    loading: boolean;
    votesAll: VoteView[];
}) {
    // Stats globales (tous les votes)
    console.log(votesAll);
    const peopleCountMap = new Map<string, number>(); // pour chaque personne, nombre de votes

    couples.forEach(couple => {
        peopleCountMap.set(couple.personA.id, 0)
        peopleCountMap.set(couple.personB.id, 0)
    })
    votesAll.forEach((vote: VoteView) => {
        peopleCountMap.set(vote.people_voted_id, peopleCountMap.get(vote.people_voted_id) + 1);
    })
    couples.forEach(couple => {
        couple.countA = peopleCountMap.get(couple.personA.id);
        couple.countB = peopleCountMap.get(couple.personB.id);
    })

    return (
        <main className="max-w-5xl mx-auto px-2 sm:px-4 py-6 space-y-4">

            {loading && <div>Chargement…</div>}

            {!loading &&
                couples.map((c) => (
                    <CoupleCard
                        key={c.id}
                        couple={c}
                        user={user}
                        myChoice={myVotes[c.id]} // juste pour surligner MON choix éventuel
                        onVote={onVote}
                        onlyMyVotes={false}
                        // La jauge s’appuie sur c.countA / c.countB → stats de tout le monde
                    />
                ))}
        </main>
    );
}
