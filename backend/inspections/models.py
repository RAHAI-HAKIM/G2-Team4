from django.db import models


class Lot(models.Model):
    class Status(models.TextChoices):
        AWAITING = "awaiting", "Awaiting inspection"
        ACCEPTED = "accepted", "Accepted"
        ON_HOLD = "on_hold", "On hold"

    code = models.CharField(max_length=32, primary_key=True)
    work_order = models.CharField(max_length=32)
    size = models.PositiveIntegerField()
    level = models.CharField(max_length=3, default="II")
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.AWAITING)

    def __str__(self) -> str:
        return self.code


class Inspection(models.Model):
    class Decision(models.TextChoices):
        ACCEPT = "accept", "Accept"
        REJECT = "reject", "Reject"

    lot = models.ForeignKey(Lot, on_delete=models.PROTECT, related_name="inspections")
    plan_key = models.CharField(max_length=32)
    plan_version = models.CharField(max_length=16)
    inspector = models.CharField(max_length=100)
    sample_size = models.PositiveIntegerField()
    ac = models.PositiveIntegerField()
    re = models.PositiveIntegerField()
    inspected_units = models.PositiveIntegerField()
    defective_units = models.PositiveIntegerField()
    decision = models.CharField(max_length=8, choices=Decision.choices)
    signed_at = models.DateTimeField(auto_now_add=True)


class Defect(models.Model):
    reference = models.CharField(max_length=20, unique=True)  # DEF-YYYY-NNNN
    inspection = models.ForeignKey(Inspection, on_delete=models.PROTECT, related_name="defects")
    lot = models.ForeignKey(Lot, on_delete=models.PROTECT, related_name="defects")
    unit = models.PositiveIntegerField()
    characteristic = models.CharField(max_length=32)
    severity = models.CharField(max_length=16)
    value = models.FloatField(null=True, blank=True)
    direction = models.CharField(max_length=8, blank=True)  # over / under, measures only
    created_at = models.DateTimeField(auto_now_add=True)
