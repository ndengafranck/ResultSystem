from .fetch import FetchData


class TeacherRole:
    def __init__(self):
        self.fetch_data = FetchData()
    def isHod(self,teacher:int):
        Teacher = self.fetch_data.fetch_hod_by_teacher_id(teacher)
        if Teacher:
            id,teach_id,department_id = Teacher
            return teach_id == teacher
        return False
    def isStaff(self,teacher:int):
        Teacher = self.fetch_data.fetch_staff_by_teacher_id(teacher)
        if Teacher and not self.isHod(teacher):
            id,teach_id,department_id = Teacher
            return teach_id == teacher
        return False
        