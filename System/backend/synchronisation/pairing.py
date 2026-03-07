from .fetch import FetchData

fetchdata = FetchData()
class Pairer:
    
    def __init__(self):
        self.user_role_pair = []
        
    def user_type_pairer(self):
        users = fetchdata.fetch_user()
        
        for user in users:
            id,fullname,email,phone,gender,dob,user_type = user
            if user_type == "Admin":
                director = fetchdata.fetch_director_by_id(id)
                self.user_role_pair.append((user,director))
            if user_type == "Teacher":
                teacher = fetchdata.fetch_teacher_by_id(id)
                self.user_role_pair.append((user,teacher))
            if user_type == "Student":
                student = fetchdata.fetch_student_by_id(id)
                self.user_role_pair.append((user,student))
        return self.user_role_pair