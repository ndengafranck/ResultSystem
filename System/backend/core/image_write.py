from django.core.files.storage import FileSystemStorage
import os

class OverWriteStorage(FileSystemStorage):
    def get_available_name(self, name, max_length=None):
        if self.exists(name):
            os.remove(os.path.join(self.location, name))
            print("By master Franck")
        return name
