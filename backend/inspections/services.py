"""
Business logic of an inspection (F4): validate what the inspector entered,
recompute the decision on the server, store the record and update the lot.

The frontend shows a proposal, but the decision that counts is computed here
(SRS BR-04, BR-05, BR-08).
"""

import re as regex

from django.db import transaction
from django.utils import timezone

from .data import PLANS, line_of_work_order
from .models import Defect, Inspection, Lot
from .sampling import sampling_plan

PIN_PATTERN = regex.compile(r"^\d{4}$")


class InspectionError(Exception):
    """A request the server refuses; `status` is the HTTP status to return."""

    def __init__(self, message: str, status: int = 400):
        super().__init__(message)
        self.message = message
        self.status = status


def plan_for_lot(lot: Lot) -> tuple[str, dict]:
    line = line_of_work_order(lot.work_order)
    if line is None:
        raise InspectionError(f"no line for work order {lot.work_order}", 500)
    return line["plan"], PLANS[line["plan"]]


def lot_sampling(lot: Lot) -> dict:
    _, plan = plan_for_lot(lot)
    return sampling_plan(lot.size, lot.level, plan["aql"]).as_dict()


def _next_defect_number(year: int) -> int:
    prefix = f"DEF-{year}-"
    last = (
        Defect.objects.filter(reference__startswith=prefix)
        .order_by("-reference")
        .values_list("reference", flat=True)
        .first()
    )
    return int(last.removeprefix(prefix)) + 1 if last else 1


def _as_int(value, field: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int):
        raise InspectionError(f"{field} must be an integer")
    return value


def _check_defect(raw: dict, characteristics: dict, inspected: int) -> dict:
    if not isinstance(raw, dict):
        raise InspectionError("each defect must be an object")
    unit = _as_int(raw.get("unit"), "defect unit")
    if not 1 <= unit <= inspected:
        raise InspectionError(f"defect unit {unit} is outside the inspected units")

    key = raw.get("characteristic")
    c = characteristics.get(key)
    if c is None:
        raise InspectionError(f"unknown characteristic: {key}")

    defect = {"unit": unit, "characteristic": key, "severity": c["severity"], "value": None, "direction": ""}
    if c["kind"] == "measure":
        value = raw.get("value")
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise InspectionError(f"a numeric value is required for {key}")
        if value > c["usl"]:
            defect["direction"] = "over"
        elif value < c["lsl"]:
            defect["direction"] = "under"
        else:
            raise InspectionError(f"{key} value {value} is within limits, not a defect")
        defect["value"] = float(value)
    return defect


def record_inspection(payload: dict) -> dict:
    if not isinstance(payload, dict):
        raise InspectionError("request body must be a JSON object")

    inspector = str(payload.get("inspector", "")).strip()
    if not inspector:
        raise InspectionError("inspector is required")
    if not PIN_PATTERN.match(str(payload.get("pin", ""))):
        raise InspectionError("PIN must be 4 digits")

    with transaction.atomic():
        try:
            lot = Lot.objects.select_for_update().get(code=payload.get("lot"))
        except Lot.DoesNotExist:
            raise InspectionError("lot not found", 404) from None
        if lot.status != Lot.Status.AWAITING:
            raise InspectionError(f"lot {lot.code} has already been inspected ({lot.status})", 409)

        plan_key, plan = plan_for_lot(lot)
        sampling = sampling_plan(lot.size, lot.level, plan["aql"])

        inspected = _as_int(payload.get("inspectedUnits"), "inspectedUnits")
        if not 1 <= inspected <= sampling.sample_size:
            raise InspectionError(f"inspectedUnits must be between 1 and {sampling.sample_size}")

        characteristics = {c["key"]: c for c in plan["characteristics"]}
        raw_defects = payload.get("defects", [])
        if not isinstance(raw_defects, list):
            raise InspectionError("defects must be a list")
        defects = [_check_defect(d, characteristics, inspected) for d in raw_defects]
        if len({(d["unit"], d["characteristic"]) for d in defects}) != len(defects):
            raise InspectionError("the same characteristic is recorded twice for one unit")

        defective_units = len({d["unit"] for d in defects})
        if defective_units >= sampling.re:
            decision = Inspection.Decision.REJECT
        elif inspected == sampling.sample_size:
            decision = Inspection.Decision.ACCEPT
        else:
            raise InspectionError(
                f"sample incomplete: {inspected} of {sampling.sample_size} units inspected"
            )

        inspection = Inspection.objects.create(
            lot=lot,
            plan_key=plan_key,
            plan_version=plan["version"],
            inspector=inspector,
            sample_size=sampling.sample_size,
            ac=sampling.ac,
            re=sampling.re,
            inspected_units=inspected,
            defective_units=defective_units,
            decision=decision,
        )

        year = timezone.localdate().year
        number = _next_defect_number(year)
        saved = []
        for offset, d in enumerate(defects):
            saved.append(
                Defect.objects.create(
                    reference=f"DEF-{year}-{number + offset:04d}",
                    inspection=inspection,
                    lot=lot,
                    **d,
                )
            )

        # A rejected lot goes on hold (BR-08).
        lot.status = Lot.Status.ON_HOLD if decision == Inspection.Decision.REJECT else Lot.Status.ACCEPTED
        lot.save(update_fields=["status"])

    return {
        "id": inspection.pk,
        "decision": decision,
        "lotStatus": lot.status,
        "defectiveUnits": defective_units,
        "signedAt": inspection.signed_at.isoformat(),
        "defects": [
            {
                "reference": d.reference,
                "unit": d.unit,
                "characteristic": d.characteristic,
                "severity": d.severity,
                "value": d.value,
                "direction": d.direction or None,
            }
            for d in saved
        ],
    }
