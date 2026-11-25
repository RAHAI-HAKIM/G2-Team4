"""
ISO 2859-1 (ANSI/ASQ Z1.4, MIL-STD-105E) — single sampling, normal inspection.

Step 1: lot size + general inspection level -> sample-size code letter (Table 1).
Step 2: code letter + AQL -> sample size n, acceptance number Ac, rejection
number Re (Table 2-A).

Only AQL 2.5 is included for the prototype. Where Table 2-A shows an arrow at
AQL 2.5 the plan it points to is used: A, B, D -> C (n=5, 0/1); E -> F
(n=20, 1/2); P, Q -> N (n=500, 21/22). If n is not smaller than the lot, the
whole lot is inspected (100 %) with the same Ac / Re.

Values were cross-checked against published reproductions of the tables
(aqlchart.com, tetrainspection.com, Nov 2026). They must still be verified cell
by cell against the standard itself (SRS VER-02).
"""

from dataclasses import dataclass

# (max lot size, letter for level I, letter for level II)
CODE_LETTERS: list[tuple[float, str, str]] = [
    (8, "A", "A"),
    (15, "A", "B"),
    (25, "B", "C"),
    (50, "C", "D"),
    (90, "C", "E"),
    (150, "D", "F"),
    (280, "E", "G"),
    (500, "F", "H"),
    (1200, "G", "J"),
    (3200, "H", "K"),
    (10000, "J", "L"),
    (35000, "K", "M"),
    (150000, "L", "N"),
    (500000, "M", "P"),
    (float("inf"), "N", "Q"),
]

# AQL -> code letter -> (n, Ac, Re), arrows already resolved
PLANS_BY_AQL: dict[float, dict[str, tuple[int, int, int]]] = {
    2.5: {
        "A": (5, 0, 1),
        "B": (5, 0, 1),
        "C": (5, 0, 1),
        "D": (5, 0, 1),
        "E": (20, 1, 2),
        "F": (20, 1, 2),
        "G": (32, 2, 3),
        "H": (50, 3, 4),
        "J": (80, 5, 6),
        "K": (125, 7, 8),
        "L": (200, 10, 11),
        "M": (315, 14, 15),
        "N": (500, 21, 22),
        "P": (500, 21, 22),
        "Q": (500, 21, 22),
    },
}


@dataclass(frozen=True)
class SamplingPlan:
    code_letter: str
    sample_size: int
    ac: int
    re: int

    def as_dict(self) -> dict:
        return {
            "codeLetter": self.code_letter,
            "sampleSize": self.sample_size,
            "ac": self.ac,
            "re": self.re,
        }


def sampling_plan(lot_size: int, level: str, aql: float = 2.5) -> SamplingPlan:
    if lot_size < 2:
        raise ValueError("lot size must be at least 2")
    if level not in ("I", "II"):
        raise ValueError(f"unsupported inspection level: {level}")
    if aql not in PLANS_BY_AQL:
        raise ValueError(f"unsupported AQL: {aql}")

    letter = next(i if level == "I" else ii for mx, i, ii in CODE_LETTERS if lot_size <= mx)
    n, ac, re = PLANS_BY_AQL[aql][letter]
    return SamplingPlan(letter, min(n, lot_size), ac, re)
