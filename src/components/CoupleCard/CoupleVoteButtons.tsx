import { useState } from "react";
import { CoupleView } from "../../models/models";

export default function CoupleVoteButtons({
                                              couple,
                                              user,
                                              canVote,
                                              myChoice,
                                              onVote,
                                          }: {
    couple: CoupleView;
    user: any;
    canVote: boolean;
    myChoice?: "A" | "B" | "tie";
    onVote?: (c: CoupleView, choice: "A" | "B" | "tie") => void;
}) {
    const [voted, setVoted] = useState<"A" | "B" | "tie" | null>(null);

    const handleVote = (choice: "A" | "B" | "tie") => {
        if (!canVote || !onVote) return;
        setVoted(choice);
        onVote(couple, choice);
        setTimeout(() => setVoted(null), 700);
    };

    const baseClasses =
        "flex-1 px-3 py-2 rounded-full border font-medium text-sm transition-all duration-200 ease-out active:scale-95 text-center focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/50 focus:ring-offset-2";
    const disabledClasses = !canVote ? "opacity-60 cursor-not-allowed" : "";

    const getAnimationClasses = (choice: "A" | "B" | "tie") => {
        if (voted !== choice) return "";
        return choice === "tie"
            ? "animate-[pop_0.4s_ease-out] bg-secondary/10 border-secondary text-secondary"
            : "animate-[pop_0.4s_ease-out] bg-primary/10 border-primary text-primary shadow-sm";
    };

    return (
        <>
            {/* Animation keyframes */}
            <style>
                {`
          @keyframes pop {
            0% { transform: scale(1); }
            50% { transform: scale(1.12); }
            100% { transform: scale(1); }
          }
        `}
            </style>

            <div className="mt-4 flex gap-3 justify-center w-full">
                {/* 🩷 Person A */}
                <button
                    disabled={!canVote}
                    onClick={() => handleVote("A")}
                    className={`${baseClasses} ${
                        myChoice === "A"
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-background border-border text-foreground hover:bg-muted"
                    } ${getAnimationClasses("A")} ${disabledClasses}`}
                >
                    {couple.personA.display_name}
                </button>

                {/* ⚖️ Égalité */}
                <button
                    disabled={!canVote}
                    onClick={() => handleVote("tie")}
                    className={`${baseClasses} max-w-[120px] ${
                        myChoice === "tie"
                            ? "bg-secondary/10 border-secondary text-secondary"
                            : "bg-background border-border text-muted-foreground hover:bg-muted"
                    } ${getAnimationClasses("tie")} ${disabledClasses}`}
                >
                    Égalité
                </button>

                {/* 💘 Person B */}
                <button
                    disabled={!canVote}
                    onClick={() => handleVote("B")}
                    className={`${baseClasses} ${
                        myChoice === "B"
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-background border-border text-foreground hover:bg-muted"
                    } ${getAnimationClasses("B")} ${disabledClasses}`}
                >
                    {couple.personB.display_name}
                </button>
            </div>
        </>
    );
}
