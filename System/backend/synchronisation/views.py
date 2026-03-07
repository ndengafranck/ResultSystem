from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from .sync import Sync

sync = Sync()
@api_view(["GET"])
# @permission_classes([AllowAny])
def sync_data(request):
    structure_models = ["School","Department","LevelDregee","DepartmentLevelDegree","Class"]
    academics_models = ["Course","CourseType","ClassCourse","Exam","ExamType","ExamExamType","StudentClassCourse","TeacherAssignment"]
    sync.sync_user()
    for model in structure_models:
        sync.sync_structure(model)
    sync.sync_user_role()
    for model in academics_models:
        sync.sync_academic(model)
    return Response({"message":"Data Successfully fetched!!"})

