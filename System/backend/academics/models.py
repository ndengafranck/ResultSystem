from django.db import models
from structure.models import Class
from user.models import Staff,Student,Teacher

# The course model
class Course(models.Model):
    external_id = models.IntegerField(null=False,blank=False)
    code = models.CharField(max_length=20,null=False,blank=False)
    name = models.CharField(max_length=150,blank=False,null=False)
    desc = models.TextField(null=False,blank=False)

    def __str__(self):
        return f"Course {self.code}"
    
# Course Type model
class CourseType(models.Model):
    external_id = models.IntegerField(null=False,blank=False)
    name = models.CharField(max_length=150,blank=False,null=False)
    desc = models.TextField(null=False,blank=False)
    
    def __str__(self):
        return f"CourseType: {self.name}"
    

# class has course model
class ClassCourse(models.Model):
    external_id = models.IntegerField(null=False,blank=False)
    _class = models.ForeignKey(Class,on_delete=models.CASCADE)
    course = models.ForeignKey(Course,on_delete=models.CASCADE)
    credit = models.IntegerField(null=False,blank=False)
    academic_year = models.CharField(max_length=10,null=False,blank=False)
    semester_num = models.IntegerField(null=False,blank=False)
    course_type = models.ForeignKey(CourseType,on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Class {self._class.name} offer {self.course.code}"
    
# Teacher's Assignment in a class
class TeacherAssignment(models.Model):
    external_id = models.IntegerField(null=False,blank=False)
    teacher = models.ForeignKey(Teacher,on_delete=models.CASCADE,null=False,blank=False)
    class_course = models.OneToOneField(ClassCourse,null=False,blank=False,on_delete=models.CASCADE)
    academic_year = models.CharField(max_length=15,blank=False,null=False)
    semester_num = models.IntegerField(null=False,blank=False)

# Exam class models
class Exam(models.Model):
    external_id = models.IntegerField(null=False,blank=False)
    class_course = models.ForeignKey(ClassCourse,on_delete=models.CASCADE,null=True,blank=True)
    
    def __str__(self):
        return f"Exam of {self.class_course.course.name} in {self.class_course._class.name}"
   

# Exam types models 
class ExamType(models.Model):
    external_id = models.IntegerField(null=False,blank=False)
    name = models.CharField(max_length=45,null=False,blank=False)
   
    def __str__(self):
       return f"ExamType : {self.name}"

# Exam and Their mapped Types
class ExamExamType(models.Model):
    external_id = models.IntegerField(null=True,blank=True)
    exam = models.ForeignKey(Exam,on_delete=models.CASCADE)
    exam_type = models.ForeignKey(ExamType,on_delete=models.CASCADE)
    exam_date = models.DateField()
    weight_percent = models.DecimalField(max_digits=5,decimal_places=2,null=False,blank=False)
    max_mark = models.DecimalField(max_digits=5,decimal_places=2,null=True,blank=True)
    
    def __str__(self):
        return f"Exam: {self.exam.id} of Type: {self.exam_type.name} on {self.exam_date}"



# Exams Results
class ExamResult(models.Model):
    class Remark(models.TextChoices):
        EXCELLENT = "Excellent"
        VERYGOOD = "Very Good"
        GOOD = "Good"
        AVERAGE = "Average"
        FAIRLYGOOD = "Fairly Good"
        WEAK = "Weak"
    
    
    mark_obtained = models.DecimalField(max_digits=5,decimal_places=2,null=True,blank=True)
    remark = models.CharField(choices=Remark.choices,null=True,blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True,blank=True)
    exam_exam_type = models.ForeignKey(ExamExamType,on_delete=models.CASCADE,related_name="exam_results",null=True,blank=True,default=None)
    uploaded_by = models.ForeignKey(Staff,on_delete=models.SET_NULL,null=True,blank=True)
    student = models.ForeignKey(Student,on_delete=models.CASCADE)
    
    def __str__(self):
        return f"Student: {self.student.matricule} scored: {self.mark_obtained}"
    
    def get_gpa(self):
        remark_to_gpa = {
            self.Remark.EXCELLENT: 4.0,
            self.Remark.VERYGOOD: 3.7,
            self.Remark.GOOD: 3.3,
            self.Remark.FAIRLYGOOD: 3.0,
            self.Remark.AVERAGE: 2.0,
            self.Remark.WEAK: 0.0,
        }
        return remark_to_gpa.get(self.remark,0.0)
    

# Complaints models
class Complaint(models.Model):
    
    # complaints status
    class Status(models.TextChoices):
        SUBMITTED = "Submitted"
        APPROVED = "Approved"
        RESPONDED = "Responded"
        SOLVED = "Solved"
        REJECTED = "Rejected"
        REVIEW = "Under Review","under review"
        
    original_mark = models.DecimalField(max_digits=5,decimal_places=2,null=True,blank=True)
    concern = models.TextField(null=False,blank=False)
    evidence = models.ImageField(upload_to="complaints/evidence/",null=True,blank=True)
    resolution_sought = models.CharField(max_length=100,null=False,blank=False)
    student = models.ForeignKey(Student,on_delete=models.CASCADE,blank=False,null=False)
    exam_exam_type = models.ForeignKey(ExamExamType,on_delete=models.CASCADE,blank=False,null=False)
    status = models.CharField(choices=Status.choices,default=Status.SUBMITTED)
    created_at = models.DateTimeField(auto_now_add=True,null=True,blank=True)

    def __str__(self):
        return f"The student: {self.student.matricule} concern: {self.concern}"



# Transcript model
class Transcript(models.Model):
    class Status(models.TextChoices):
        PENDING   = "Pending"
        VALIDATED = "Validated"
        REJECTED  = "Rejected"

    student       = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="transcripts")
    requested_at  = models.DateTimeField(auto_now_add=True)
    academic_year = models.CharField(max_length=10, null=True, blank=True)
    status        = models.CharField(choices=Status.choices, default=Status.PENDING, max_length=20)

    # Signatures — each role optionally stamps
    director_signature = models.ForeignKey("user.Signature", null=True, blank=True,
                                           on_delete=models.SET_NULL, related_name="director_transcripts")
    hod_signature      = models.ForeignKey("user.Signature", null=True, blank=True,
                                           on_delete=models.SET_NULL, related_name="hod_transcripts")
    staff_signature    = models.ForeignKey("user.Signature", null=True, blank=True,
                                           on_delete=models.SET_NULL, related_name="staff_transcripts")

    validated_at = models.DateTimeField(null=True, blank=True)
    notes        = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Transcript({self.student.matricule} – {self.status})"