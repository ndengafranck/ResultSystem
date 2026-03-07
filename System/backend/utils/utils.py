

# Results Remark 
from decimal import Decimal

from academics.models import ExamResult


def compute_remark(max_mark:Decimal,mark: Decimal) -> str:
    compute_mark = (mark/max_mark) * 100
    if compute_mark >= 90:
        return ExamResult.Remark.EXCELLENT
    elif compute_mark >= 80:
        return ExamResult.Remark.VERYGOOD
    elif compute_mark >= 70:
        return ExamResult.Remark.GOOD
    elif compute_mark >= 60:
        return ExamResult.Remark.FAIRLYGOOD
    elif compute_mark >= 50:
        return ExamResult.Remark.AVERAGE
    else:
        return ExamResult.Remark.WEAK

    