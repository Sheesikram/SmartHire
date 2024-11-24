from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from signup.models import Job, Report
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from getUserData.JWT import CustomJWTAuthentication
from rest_framework.permissions import IsAuthenticated

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def create_report(request):
    # Get the job_id from the request body
    job_id = request.data.get('job_id')

    # Ensure job_id is provided in the request
    if not job_id:
        return Response({"error": "Job ID is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Check if the job exists
        job = Job.objects.get(id=job_id)
    except Job.DoesNotExist:
        return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)

    # Check if a report already exists for this job
    if Report.objects.filter(job=job).exists():
        return Response({"message": "Report already exists for this job"}, status=status.HTTP_200_OK)

    # Create a new report for the job
    report = Report.objects.create(job=job)

    return Response({"message": "Report created successfully", "report_id": report.id}, status=status.HTTP_201_CREATED)
