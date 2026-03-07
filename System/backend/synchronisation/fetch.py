from django.db import connections

class FetchData:
    def __init__(self):
        self.cursor = connections['university_db'].cursor()
    
    # Users fetches 
    def fetch_user(self):
        self.cursor.execute("SELECT id,fullname,email,phone,gender,dob,user_type FROM users")
        univ_users = self.cursor.fetchall()
        return univ_users
    
    def fetch_director_by_id(self,id:int):
        self.cursor.execute(f"SELECT matricule,admin_id,profile_pic FROM admins WHERE admin_id ={id}")
        director = self.cursor.fetchone()
        return director
    def fetch_teacher_by_id(self,id:int):
        self.cursor.execute(f"SELECT matricule,teacher_id,school_email,department_id,profile_pic FROM teachers WHERE teacher_id ={id}")
        teacher = self.cursor.fetchone()
        return teacher
    def fetch_student_by_id(self,id:int):
        self.cursor.execute(f"SELECT matricule,student_id,school_email,profile_pic,enrollment_year FROM students WHERE student_id ={id}")
        student = self.cursor.fetchone()
        return student
    def fetch_hod_by_teacher_id(self,id:int):
        self.cursor.execute(f"SELECT id,teacher_id,department_id FROM hods WHERE teacher_id ={id}")
        hod = self.cursor.fetchone()
        return hod
    def fetch_staff_by_teacher_id(self,id:int):
        self.cursor.execute(f"""SELECT staff.id,staff.teacher_id,teachers.department_id 
                            FROM staff INNER JOIN teachers ON staff.teacher_id = teachers.teacher_id  
                            AND staff.department_id = teachers.department_id  WHERE staff.teacher_id ={id}""")
        staff = self.cursor.fetchone()
        return staff
    
    
    
    # STRUCTURE FETCHES
    def fetch_school(self):
        self.cursor.execute("SELECT id,name,logo,address from schools")
        schools = self.cursor.fetchall()
        return schools
    def fetch_department(self):
        self.cursor.execute("SELECT id,name,logo,code,school_id from departments")
        departments = self.cursor.fetchall()
        return departments
    def fetch_level_degree(self):
        self.cursor.execute("SELECT id,name,code from level_degrees")
        level_degree = self.cursor.fetchall()
        return level_degree
    def fetch_level_department(self):
        self.cursor.execute("SELECT id,department_id,level_degree_id,num_levels FROM department_degrees")
        level_department = self.cursor.fetchall()
        return level_department
    def fetch_class(self):
        self.cursor.execute("SELECT id,name,level_number,department_degree_id FROM classes")
        classes = self.cursor.fetchall()
        return classes
    
    
    # Fetch the Academics models
    def fetch_course(self):
        self.cursor.execute("SELECT id,code,name,description FROM courses")
        courses = self.cursor.fetchall()
        
        return courses
    
    def fetch_course_type(self):
        self.cursor.execute("SELECT id,name,description FROM course_categories")
        
        c_types = self.cursor.fetchall()
        
        return c_types
    
    def fetch_class_course(self):
        self.cursor.execute("SELECT id,class_id,course_id,category_id,academic_year,semester_num,credit FROM class_courses")
        class_courses = self.cursor.fetchall()
        
        return class_courses
    
    def fetch_exam(self):
        self.cursor.execute("SELECT id,class_course_id FROM exams")
        
        exams = self.cursor.fetchall()
        
        return exams
    
    def fetch_exam_type(self):
        self.cursor.execute("SELECT id, name, description FROM exam_types")
        
        exam_types = self.cursor.fetchall()
        
        return exam_types
    
    def fetch_exam_exam_type(self):
        self.cursor.execute("SELECT id,exam_id,exam_type_id,exam_date,weight_percentage,max_marks FROM exam_components")
        exam_exam_types = self.cursor.fetchall()
        
        return exam_exam_types
    
    # Fetch teachers assigned to courses in a class
    def fetch_teacher_assignment(self):
        self.cursor.execute("SELECT id,teacher_id,class_course_id,academic_year,semester_num FROM teacher_assignments")
        return self.cursor.fetchall()
    # STUDENT ENROLLED IN CLASSES
    def fetch_student_class_course(self):
        self.cursor.execute("SELECT id,student_id,class_course_id,status,enrollment_date FROM course_enrollments")
        student_class_courses = self.cursor.fetchall()
        
        return student_class_courses