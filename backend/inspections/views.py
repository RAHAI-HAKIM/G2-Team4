import json

from django.http import HttpRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .data import LINES, PLANS
from .models import Lot
from .services import InspectionError, lot_sampling, record_inspection


@require_GET
def catalog(request: HttpRequest) -> JsonResponse:
    """Lines -> work orders -> lots (with status and sampling plan), plus the plans."""
    lots_by_order: dict[str, list[dict]] = {}
    for lot in Lot.objects.order_by("code"):
        lots_by_order.setdefault(lot.work_order, []).append(
            {
                "id": lot.code,
                "size": lot.size,
                "level": lot.level,
                "status": lot.status,
                "sampling": lot_sampling(lot),
            }
        )

    lines = [
        {
            "key": line["key"],
            "plan": line["plan"],
            "product": line["product"],
            "workOrders": [
                {**w, "lots": lots_by_order.get(w["id"], [])}
                for w in line["workOrders"]
                if lots_by_order.get(w["id"])
            ],
        }
        for line in LINES
    ]
    return JsonResponse({"lines": [l for l in lines if l["workOrders"]], "plans": PLANS})


# No session or cookie authentication exists in the prototype, so CSRF does not apply.
@csrf_exempt
@require_POST
def create_inspection(request: HttpRequest) -> JsonResponse:
    try:
        payload = json.loads(request.body or b"{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "invalid JSON"}, status=400)
    try:
        result = record_inspection(payload)
    except InspectionError as e:
        return JsonResponse({"error": e.message}, status=e.status)
    return JsonResponse(result, status=201)
