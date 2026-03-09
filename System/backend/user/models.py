from django.db import models
# Import the AbstractUser from django model
from django.contrib.auth.models import AbstractUser
from structure.models import Department

# Import the images overwriter
from core.image_write import OverWriteStorage

# The Signature model
class Signature(models.Model):
    image = models.ImageField(upload_to="signatures/",null=False,blank=False)
    created_at = models.DateTimeField(null=False,blank=False,auto_now_add=True)
    upload_at = models.DateTimeField(null=False,blank=False,auto_now=True)
    

# The Main User class model
class User(AbstractUser):
    # The 3 main roles derived from user model
    class UserType(models.TextChoices):
        DIRECTOR = "Admin"
        TEACHER = "Teacher"
        STUDENT = "Student"
        
    # Status of each user in the system
    class Status(models.TextChoices):
        ACTIVE = "Active"
        SUSPENDED = "Suspended"
        
    
    # Gender choices for the user model
    class Gender(models.TextChoices):
        MALE = "Male"
        FEMALE = "Female"
        OTHER = "Other"
    external_id = models.IntegerField(null=True,blank=True)
    user_type = models.CharField(choices=UserType.choices,null=False)
    phone = models.CharField(max_length=20,null=False,blank=False)
    dob = models.DateField(null=False,blank=False)
    gender = models.CharField(max_length=10,choices=Gender.choices,null=False,blank=False)
    status = models.CharField(choices=Status.choices,null=False,blank=False,default=Status.ACTIVE)
    created_at = models.DateTimeField(blank=True,null=True,auto_now_add=True)
    
    def __str__(self):
        return f"{self.username} - {self.user_type}"
    def fullname(self):
        return f"{self.first_name} {self.last_name}".strip().upper()


# The Director Model
class Director(models.Model):
    external_id = models.IntegerField(null=True,blank=True)
    matricule = models.CharField(max_length=20,null=False,blank=False)
    user = models.OneToOneField(User,on_delete=models.CASCADE,related_name="director")
    signature = models.OneToOneField(Signature,on_delete=models.SET_NULL,null=True,blank=True)
    profile_pic = models.ImageField(upload_to="directors/profile_pics/",null=True,blank=True,storage=OverWriteStorage())
    
    def __str__(self):
        return f"{self.user.username} - Director"

# The Teacher model that's the second user extension
class Teacher(models.Model):
    external_id = models.IntegerField(null=True,blank=True)
    matricule = models.CharField(max_length=20,blank=False,null=False)
    school_mail = models.CharField(max_length=45,null=True,blank=True)
    is_hod = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    user = models.OneToOneField(User,on_delete=models.CASCADE,related_name="teacher")
    department = models.ForeignKey(Department,on_delete=models.SET_NULL,null=True,blank=True)
    profile_pic = models.ImageField(upload_to="teachers/profile_pics/",null=True,blank=True,storage=OverWriteStorage())
    
    def __str__(self):
        return f"{self.user.username} - Teacher"

# The Teacher's Derived Models
# - HOD Model:
class HOD(models.Model):
    external_id = models.IntegerField(null=True,blank=True)
    teacher = models.OneToOneField(Teacher,on_delete=models.CASCADE,related_name="hod")
    signature = models.OneToOneField(Signature,on_delete=models.SET_NULL,null=True,blank=True)
    department = models.OneToOneField(Department,on_delete=models.CASCADE,blank=True,null=True,related_name="hod")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.teacher.user.username} - HOD"

# - Staff model
class Staff(models.Model):
    external_id = models.IntegerField(null=True,blank=True)
    teacher = models.OneToOneField(Teacher,on_delete=models.CASCADE,related_name="staff")
    signature = models.OneToOneField(Signature,on_delete=models.SET_NULL,null=True,blank=True)
    department = models.ForeignKey(Department,on_delete=models.CASCADE,blank=True,null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.teacher.user.username} - Staff"
    

# The Student Model
class Student(models.Model):
    external_id = models.IntegerField(null=True,blank=True)
    matricule = models.CharField(max_length=20,null=False,blank=False)
    school_mail = models.CharField(max_length=50,null=False,blank=False)
    enrolled_year = models.IntegerField(null=False,blank=False)
    user = models.OneToOneField(User,on_delete=models.CASCADE,related_name="student")
    profile_pic = models.ImageField(upload_to="students/profile_pics/",null=True,blank=True,storage=OverWriteStorage())
    
    def __str__(self):
        return f"{self.user.username} - Student"
    
    
# Student in class and course (Enrollements)
class StudentClassCourse(models.Model):
    
    class Status(models.TextChoices):
        ENROLLED = "Enrolled"
        COMPLETED = "Completed"
        SUSPENDED = "Suspended"
    external_id = models.IntegerField(null=True,blank=True)
    student = models.ForeignKey(Student,on_delete=models.CASCADE)
    class_course = models.ForeignKey("academics.ClassCourse",on_delete=models.CASCADE)
    status = models.CharField(choices=Status.choices,blank=False,null=False,default=Status.ENROLLED)
    enrolled_date = models.DateField()
    
    
    def __str__(self):
        return f"The student {self.student.matricule} is in {self.class_course._class.name} and offer {self.class_course.course.name}"
    