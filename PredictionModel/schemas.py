from pydantic import BaseModel
from typing import List, Optional, Any, Dict

class TimeRow(BaseModel):
    date: Optional[str] = None
    open: float
    high: float
    low: float
    close: float
    # if you have extra fields (volume etc.) they will be ignored unless added here

class PredictInput(BaseModel):
    # Either send `features` (list of numbers) OR `timeseries` (list of TimeRow)
    features: Optional[List[float]] = None
    timeseries: Optional[List[TimeRow]] = None
    meta: Optional[Dict[str, Any]] = None