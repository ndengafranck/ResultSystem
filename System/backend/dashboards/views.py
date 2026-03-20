from django.shortcuts import render
from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response

from core.permissions import *
from structure.models import *
from academics.models import ExamResult, Complaint, ClassCourse, Transcript
from user.models import Student, HOD, Staff, StudentClassCourse

# The various roles dashboards
# Director's Dashboard
@api_view(["GET"])
@permission_classes([IsDirector])
def director_dashboard(request):
    director = getattr(request.user, "director", None)
    school   = director.school if director else None

    if not school:
        return Response({"error": "No school assigned to this director."}, status=400)

    # All departments in this school
    departments = Department.objects.filter(school=school)

    # All classes in those departments
    classes = Class.objects.filter(
        department_level_degree__department__in=departments
    )

    # Students enrolled in those classes
    student_ids = StudentClassCourse.objects.filter(
        class_course___class__in=classes
    ).values_list("student_id", flat=True).distinct()
    total_students = len(list(student_ids))

    # Pending complaints in this school
    pending_complaints = Complaint.objects.filter(
        exam_exam_type__exam__class_course___class__in=classes,
        status=Complaint.Status.SUBMITTED,
    ).count()

    # Pending transcript requests in this school
    pending_transcripts = Transcript.objects.filter(
        student__studentclasscourse__class_course___class__in=classes,
        status=Transcript.Status.PENDING,
    ).distinct().count()

    # Unpublished results in this school
    unpublished_results = ExamResult.objects.filter(
        exam_exam_type__exam__class_course___class__in=classes,
        is_published=False,
    ).count()

    # Per-department breakdown
    dept_breakdown = []
    for dept in departments:
        dept_classes = classes.filter(department_level_degree__department=dept)
        dept_students = StudentClassCourse.objects.filter(
            class_course___class__in=dept_classes
        ).values_list("student_id", flat=True).distinct()
        dept_breakdown.append({
            "id":       dept.id,
            "name":     dept.name,
            "code":     dept.code,
            "logo":     request.build_absolute_uri(dept.logo.url) if dept.logo else None,
            "classes":  dept_classes.count(),
            "students": len(list(dept_students)),
        })

    data = {
        "school_name":          school.name,
        "school_code":          school.code,
        "school_logo":          request.build_absolute_uri(school.logo.url) if school.logo else None,
        "total_departments":    departments.count(),
        "total_classes":        classes.count(),
        "total_students":       total_students,
        "pending_complaints":   pending_complaints,
        "pending_transcripts":  pending_transcripts,
        "unpublished_results":  unpublished_results,
        "departments":          dept_breakdown,
    }
    return Response(data)


# Hod's Dashboard
@api_view(["GET"])
@permission_classes([IsHOD])
def hod_dashboard(request):
    teacher = request.user.teacher
    hod = HOD.objects.filter(teacher=teacher).first()
    department = hod.department if hod else None

    # Classes in this HOD's department
    classes = Class.objects.filter(
        department_level_degree__department=department
    )
    total_classes = classes.count()

    # Students enrolled in those classes
    student_ids = StudentClassCourse.objects.filter(
        class_course___class__in=classes
    ).values_list("student_id", flat=True).distinct()
    total_students = len(student_ids)

    # Pending complaints
    pending_complaints = Complaint.objects.filter(
        exam_exam_type__exam__class_course___class__in=classes,
        status=Complaint.Status.SUBMITTED,
    ).count()

    # Unpublished results
    unpublished_results = ExamResult.objects.filter(
        exam_exam_type__exam__class_course___class__in=classes,
        is_published=False,
    ).count()

    data = {
        "department": department.name if department else "N/A",
        "total_classes": total_classes,
        "total_students": total_students,
        "pending_complaints": pending_complaints,
        "unpublished_results": unpublished_results,
    }
    
    return Response(data)
    

# Staff's Dashboard
@api_view(["GET"])
@permission_classes([IsStaff])
def staff_dashboard(request):
    teacher = request.user.teacher
    staff = Staff.objects.filter(teacher=teacher).first()
    department = staff.department if staff else None

    classes = Class.objects.filter(
        department_level_degree__department=department
    )

    student_ids = StudentClassCourse.objects.filter(
        class_course___class__in=classes
    ).values_list("student_id", flat=True).distinct()

    pending_complaints = Complaint.objects.filter(
        exam_exam_type__exam__class_course___class__in=classes,
        status=Complaint.Status.SUBMITTED,
    ).count()

    data = {
        "department": department.name if department else "N/A",
        "total_classes": classes.count(),
        "total_students": len(student_ids),
        "pending_complaints": pending_complaints,
    }
    return Response(data)


# Student's Dashboard
@api_view(["GET"])
@permission_classes([IsStudent])
def student_dashboard(request):
    student = request.user.student

    # All enrolled courses
    enrollments = StudentClassCourse.objects.filter(
        student=student
    ).select_related("class_course__course", "class_course___class")

    courses = [
        {
            "course_name": e.class_course.course.name,
            "course_code": e.class_course.course.code,
            "class_name": e.class_course._class.name,
            "credits": e.class_course.credit,
            "semester": e.class_course.semester_num,
            "status": e.status,
        }
        for e in enrollments
    ]

    # Published results count
    total_published = ExamResult.objects.filter(
        student=student, is_published=True
    ).count()

    # Pending complaints
    pending_complaints = Complaint.objects.filter(
        student=student, status=Complaint.Status.SUBMITTED
    ).count()

    data = {
        "total_courses": len(courses),
        "total_results_published": total_published,
        "pending_complaints": pending_complaints,
        "courses": courses,
    }
    return Response(data)


