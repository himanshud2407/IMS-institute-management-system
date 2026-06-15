if __name__ == '__main__':
    import json
    import os

    import django

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    django.setup()

    from teachers.models import Teacher
    from teachers.serializers import TeacherSerializer

    teachers = Teacher.objects.all()
    serializer = TeacherSerializer(teachers, many=True)
    print(json.dumps(serializer.data, indent=2))
