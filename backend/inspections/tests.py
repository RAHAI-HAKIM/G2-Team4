import json

from django.test import TestCase

from .models import Defect, Lot
from .sampling import sampling_plan


class SamplingTests(TestCase):
    """ISO 2859-1 code letters and AQL 2.5 plans (values to verify against the standard)."""

    def test_code_letter_boundaries(self):
        cases = [
            # (lot size, level, letter, n, Ac, Re)
            (8, "II", "A", 5, 0, 1),
            (9, "II", "B", 5, 0, 1),
            (150, "II", "F", 20, 1, 2),
            (151, "II", "G", 32, 2, 3),
            (280, "I", "E", 20, 1, 2),
            (900, "I", "G", 32, 2, 3),
            (1200, "I", "G", 32, 2, 3),
            (1201, "I", "H", 50, 3, 4),
            (3200, "I", "H", 50, 3, 4),
            (3200, "II", "K", 125, 7, 8),
            (10000, "II", "L", 200, 10, 11),
            (35001, "II", "N", 500, 21, 22),
            (150001, "II", "P", 500, 21, 22),
            (600000, "II", "Q", 500, 21, 22),
        ]
        for size, level, letter, n, ac, re in cases:
            with self.subTest(size=size, level=level):
                plan = sampling_plan(size, level)
                self.assertEqual(
                    (plan.code_letter, plan.sample_size, plan.ac, plan.re), (letter, n, ac, re)
                )

    def test_sample_never_exceeds_lot(self):
        self.assertEqual(sampling_plan(3, "II").sample_size, 3)

    def test_invalid_inputs(self):
        with self.assertRaises(ValueError):
            sampling_plan(1, "II")
        with self.assertRaises(ValueError):
            sampling_plan(100, "III")


class InspectionApiTests(TestCase):
    # LOT-2026-0418: 900 units, level I -> n=32, Ac=2, Re=3 (seeded by migration)
    LOT = "LOT-2026-0418"

    def post(self, **overrides):
        body = {
            "lot": self.LOT,
            "inspector": "Test Inspector",
            "pin": "1234",
            "inspectedUnits": 32,
            "defects": [],
        }
        body.update(overrides)
        return self.client.post("/api/inspections/", json.dumps(body), content_type="application/json")

    def test_catalog_lists_lots_with_sampling(self):
        data = self.client.get("/api/catalog/").json()
        lots = {lot["id"]: lot for line in data["lines"] for w in line["workOrders"] for lot in w["lots"]}
        self.assertEqual(lots[self.LOT]["sampling"], {"codeLetter": "G", "sampleSize": 32, "ac": 2, "re": 3})
        self.assertEqual(lots[self.LOT]["status"], "awaiting")
        self.assertIn("filling", data["plans"])

    def test_accept_when_defectives_within_ac(self):
        r = self.post(defects=[{"unit": 4, "characteristic": "cap"}, {"unit": 4, "characteristic": "label"}])
        self.assertEqual(r.status_code, 201, r.content)
        self.assertEqual(r.json()["decision"], "accept")
        self.assertEqual(r.json()["defectiveUnits"], 1)
        self.assertEqual(Lot.objects.get(code=self.LOT).status, "accepted")
        self.assertRegex(r.json()["defects"][0]["reference"], r"^DEF-\d{4}-0001$")

    def test_reject_puts_lot_on_hold_and_numbers_defects(self):
        r = self.post(
            inspectedUnits=5,  # rejection can be decided early once Re is reached
            defects=[
                {"unit": 1, "characteristic": "cap"},
                {"unit": 2, "characteristic": "volume", "value": 503},
                {"unit": 5, "characteristic": "volume", "value": 490},
            ],
        )
        self.assertEqual(r.status_code, 201, r.content)
        body = r.json()
        self.assertEqual(body["decision"], "reject")
        self.assertEqual(body["lotStatus"], "on_hold")
        refs = [d["reference"] for d in body["defects"]]
        self.assertEqual(len(set(refs)), 3)
        self.assertEqual([d["direction"] for d in body["defects"]], [None, "over", "under"])
        self.assertEqual(body["defects"][1]["severity"], "critical")  # from the plan, not the client
        self.assertEqual(Defect.objects.count(), 3)

    def test_lot_cannot_be_inspected_twice(self):
        self.assertEqual(self.post().status_code, 201)
        self.assertEqual(self.post().status_code, 409)

    def test_incomplete_sample_without_rejection_is_refused(self):
        r = self.post(inspectedUnits=10)
        self.assertEqual(r.status_code, 400)
        self.assertEqual(Lot.objects.get(code=self.LOT).status, "awaiting")

    def test_invalid_requests(self):
        cases = [
            {"pin": "12"},
            {"inspector": ""},
            {"lot": "LOT-NOPE"},
            {"inspectedUnits": 99},
            {"defects": [{"unit": 1, "characteristic": "seal"}]},  # not in this plan
            {"defects": [{"unit": 1, "characteristic": "volume", "value": 498}]},  # within limits
            {"defects": [{"unit": 40, "characteristic": "cap"}]},  # beyond inspected units
            {"defects": [{"unit": 1, "characteristic": "cap"}, {"unit": 1, "characteristic": "cap"}]},
        ]
        for overrides in cases:
            with self.subTest(**{k: str(v) for k, v in overrides.items()}):
                r = self.post(**overrides)
                self.assertIn(r.status_code, (400, 404))
        self.assertEqual(Defect.objects.count(), 0)
