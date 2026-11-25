"""
Static demo configuration for the prototype: lines, work orders and approved plans.

In the real product these are configuration data managed through the interface
(F2, F3). For the prototype they live here; only lots, inspections and defects
are stored in the database. Display names are translated in the frontend by key.
"""

# Characteristic kinds: "attribute" (pass / fail) or "measure" (value vs limits).
PLANS = {
    "filling": {
        "version": "v3.4",
        "aql": 2.5,
        "characteristics": [
            {"kind": "attribute", "key": "cap", "severity": "major"},
            {"kind": "attribute", "key": "label", "severity": "minor"},
            {
                "kind": "measure",
                "key": "volume",
                "severity": "critical",
                "unit": "ml",
                "lsl": 495,
                "target": 498,
                "usl": 500,
                "decimals": 0,
            },
        ],
    },
    "packaging": {
        "version": "v2.1",
        "aql": 2.5,
        "characteristics": [
            {"kind": "attribute", "key": "seal", "severity": "major"},
            {"kind": "attribute", "key": "code", "severity": "minor"},
            {
                "kind": "measure",
                "key": "weight",
                "severity": "major",
                "unit": "kg",
                "lsl": 9.1,
                "target": 9.3,
                "usl": 9.5,
                "decimals": 1,
            },
        ],
    },
}

LINES = [
    {
        "key": "line1",
        "plan": "packaging",
        "product": "waterPack",
        "workOrders": [{"id": "OF-2026-1102", "shift": "morning"}],
    },
    {
        "key": "line2",
        "plan": "filling",
        "product": "water",
        "workOrders": [
            {"id": "OF-2026-1104", "shift": "morning"},
            {"id": "OF-2026-1103", "shift": "afternoon"},
        ],
    },
]

# Lots created by the seed migration (code, work order, lot size, inspection level).
SEED_LOTS = [
    ("LOT-2026-0415", "OF-2026-1102", 1200, "I"),
    ("LOT-2026-0417", "OF-2026-1104", 3200, "I"),
    ("LOT-2026-0418", "OF-2026-1104", 900, "I"),
    ("LOT-2026-0416", "OF-2026-1103", 3200, "I"),
]


def line_of_work_order(work_order_id: str) -> dict | None:
    for line in LINES:
        if any(w["id"] == work_order_id for w in line["workOrders"]):
            return line
    return None
