import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from daos.driver_dao import DriverDAO
from core.exceptions import (
    DatabaseConnectionError,
    NotFoundError,
)

from schemas.driver_schema import DriverResponse


logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/drivers",
    tags=["drivers"]
)


def get_driver_dao():
    return DriverDAO()



@router.get(
    "",
    response_model=List[DriverResponse]
)
def get_drivers(
    driver_dao: DriverDAO = Depends(get_driver_dao)
):

    try:
        drivers = driver_dao.get_available_drivers()

    except DatabaseConnectionError as exc:
        logger.error(
            "Driver lookup failed: %s",
            exc
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Driver service unavailable"
        )


    return [
        DriverResponse(
            id=d.user_id,
            name=d.name,
            email=d.email,
            licenseNumber=d.license_number,
            isAvailable=d.is_available,
        )
        for d in drivers
    ]