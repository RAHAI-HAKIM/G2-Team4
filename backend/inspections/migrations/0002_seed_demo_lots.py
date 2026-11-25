"""Seed the demo lots so the prototype works right after `migrate`."""

from django.db import migrations

from inspections.data import SEED_LOTS


def seed(apps, schema_editor):
    Lot = apps.get_model("inspections", "Lot")
    for code, work_order, size, level in SEED_LOTS:
        Lot.objects.update_or_create(
            code=code, defaults={"work_order": work_order, "size": size, "level": level}
        )


def unseed(apps, schema_editor):
    Lot = apps.get_model("inspections", "Lot")
    Lot.objects.filter(code__in=[c for c, *_ in SEED_LOTS], inspections__isnull=True).delete()


class Migration(migrations.Migration):
    dependencies = [("inspections", "0001_initial")]

    operations = [migrations.RunPython(seed, unseed)]
