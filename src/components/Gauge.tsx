import React from 'react';

import { CoupleView, Person } from '../models/models';

export default function Gauge({ couple }: { couple: CoupleView }) {
    const countA = couple.countA;
    const countB = couple.countB;
    const total = Math.max(1, countA + countB);
    let surchopPersonPercentage: number;
    let surchopPerson: Person;
    const hasEquality = countA === countB;

    if (countA > countB) {
        surchopPerson = couple.personA;
        surchopPersonPercentage = Math.round((countA / total) * 100);
        surchopPerson.count = couple.countA;
    } else {
        surchopPerson = couple.personB;
        surchopPersonPercentage = Math.round((countB / total) * 100);
        surchopPerson.count = couple.countB;
    }
    return (
        <div>
            <div className="h-2 bg-gray-200 rounded overflow-hidden">
                <div
                    className="h-full bg-pink-500"
                    style={{ width: `${surchopPersonPercentage}%` }}
                />
            </div>
            <div className="text-xs mt-1 text-gray-600">
                {countA} vs {countB} • {countA + countB} vote{countA + countB > 1 ? 's' : ''}
            </div>
            <div className="text-xs mt-1 text-gray-600">
                {hasEquality
                    ? 'Surchopage à égalité <3'
                    : surchopPerson.display_name + ' surchop à ' + surchopPersonPercentage + ' %'}
            </div>
        </div>
    );
}
