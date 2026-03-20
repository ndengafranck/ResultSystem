from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from structure.serializers import SchoolSerializer
# Impmort the models to serialize
from .models import *

from synchronisation.sync import Sync

# credential confirmation method
def confirm_credential(login_input):
    if "@" in login_input: 
        user = User.objects.filter(email=login_input).first()
        return user
    else:
        user = User.objects.filter(phone=login_input).first()
        return user
    return user
# User ModelSerializer 
class UserSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = User
        fields = ["id",
                  "username",
                  "first_name",
                  "last_name",
                  "password",
                  "email",
                  "phone",
                  "dob",
                  "user_type",
                  "status",
                  "last_login",
                  "created_at"]
        extra_kwargs = {"password":{"write_only":True}}
        

class PasswordUpdateSerializer(serializers.ModelSerializer):
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ["email","password","new_password"]
        
    def update(self, instance, validated_data):
        email = validated_data.get("email")
        password = validated_data.get("password")
        new_password = validated_data.get("new_password")
        
        # check email
        if instance.email != email:
            raise serializers.ValidationError("Wrong Crdentials")
        
        if not instance.check_password(password):
            raise serializers.ValidationError("Wrong Credentials")
        
        instance.set_password(new_password)
        instance.save()
        
        return instance

class PasswordResetSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["email"]
    
    def update(self,instance,validated_data):
        email = validated_data.get("email")
        
        if instance.user_type == "Admin":
            role = Director.objects.filter(user=instance).first()
        elif instance.user_type == "Teacher":
            role = Teacher.objects.filter(user=instance).first()
        else:
            role = Student.objects.filter(user=instance).first()
        
        instance.set_password(role.matricule)
        instance.save()
        return instance
    
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    

    def validate(self,attrs):
        
        login_input = attrs.get("username")
        password = attrs.get("password")
        
        if not confirm_credential(login_input):
            sync = Sync()
            is_sync = sync.sync_user()
            
        user = confirm_credential(login_input)
        
        if user and user.check_password(password):
            refresh = self.get_token(user)
            return {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": UserSerializer(user).data
            }
        
        raise serializers.ValidationError("Invalid credentials")

class DirectorSerializer(serializers.ModelSerializer):
    profile_pic = serializers.SerializerMethodField()
    school = SchoolSerializer()
    class Meta:
        model = Director
        fields ="__all__"
    
    def get_profile_pic(self, obj):
        request = self.context.get("request")
        if obj.profile_pic and hasattr(obj.profile_pic, "url"):
            return request.build_absolute_uri(obj.profile_pic.url)
        return None
     
        
class TeacherSerializer(serializers.ModelSerializer):
    profile_pic = serializers.SerializerMethodField()
    class Meta:
        model = Teacher
        fields ="__all__"
    
    def get_profile_pic(self, obj):
        request = self.context.get("request")
        if obj.profile_pic and hasattr(obj.profile_pic, "url"):
            return request.build_absolute_uri(obj.profile_pic.url)
        return None
        
class HodSerializer(serializers.ModelSerializer):
    class Meta:
        model = HOD
        fields ="__all__"
        
class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields ="__all__"
        
class StudentSerializer(serializers.ModelSerializer):
    profile_pic = serializers.SerializerMethodField()
    class Meta:
        model = Student
        fields ="__all__"
    
    def get_profile_pic(self, obj):
        request = self.context.get("request")
        if obj.profile_pic and hasattr(obj.profile_pic, "url"):
            return request.build_absolute_uri(obj.profile_pic.url)
        return None
        
class SignatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Signature
        fields ="__all__"

class StudentClassCourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentClassCourse
        fields = "__all__"