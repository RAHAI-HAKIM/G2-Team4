"""
Development only: erase all inspections and defects and put the demo lots back
to "awaiting inspection", so the demonstration can be run again.

In the real product records are never deleted (SRS BR-07); this command exists
only for rehearsing the prototype demo.
"""

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from inspections.data import SEED_LOTS
from inspections.models import Defect, Inspection, Lot


class Command(BaseCommand):
    help = "Reset the prototype demo data (development only)."

    def handle(self, *args, **options):
        if not settings.DEBUG:
            raise CommandError("reset_demo only runs with DJANGO_DEBUG=1")
        Defect.objects.all().delete()
        Inspection.objects.all().delete()
        Lot.objects.all().delete()
        for code, work_order, size, level in SEED_LOTS:
            Lot.objects.create(code=code, work_order=work_order, size=size, level=level)
        self.stdout.write(self.style.SUCCESS(f"Demo reset: {len(SEED_LOTS)} lots awaiting inspection."))
