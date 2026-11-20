from fastapi import HTTPException, status

class MandiMitraException(HTTPException):
    def __init__(self, detail: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(status_code=status_code, detail=detail)

class ResourceNotFoundException(MandiMitraException):
    def __init__(self, resource: str, identifier: str):
        super().__init__(
            detail=f"{resource} with identifier '{identifier}' was not found.",
            status_code=status.HTTP_404_NOT_FOUND
        )

class InsufficientDataException(MandiMitraException):
    def __init__(self, detail: str = "Insufficient historical price records to generate recommendation."):
        super().__init__(detail=detail, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)
