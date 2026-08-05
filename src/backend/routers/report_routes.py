from fastapi import APIRouter, Depends, HTTPException, status

from controllers.report_generator import ReportGenerator
from core.exceptions import DatabaseConnectionError
from schemas.report_schema import RevenueReportResponse

router = APIRouter(
    prefix="/reports",
    tags=["reports"],
)


def get_report_generator() -> ReportGenerator:
    return ReportGenerator()


@router.get(
    "/revenue",
    response_model=RevenueReportResponse,
)
def revenue_report(
    generator: ReportGenerator = Depends(
        get_report_generator
    ),
):
    try:
        report = generator.generate_revenue_report()

    except DatabaseConnectionError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Reporting service unavailable",
        )

    return RevenueReportResponse(**report)