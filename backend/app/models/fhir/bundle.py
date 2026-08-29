from typing import Any, List, Optional
from pydantic import BaseModel


class BundleEntry(BaseModel):
    fullUrl: Optional[str] = None
    resource: dict


class FHIRBundle(BaseModel):
    resourceType: str = "Bundle"
    id: Optional[str] = None
    type: str = "document"  # "document" | "collection" | "transaction"
    timestamp: Optional[str] = None
    entry: List[BundleEntry] = []
