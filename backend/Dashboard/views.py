from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth,TruncWeek,TruncDate
from signup.models import User, Job, Subscription, Profit
from getUserData.JWT import CustomJWTAuthentication
from rest_framework.permissions import IsAuthenticated
import logging

# Configure logging for better error reporting
logger = logging.getLogger(__name__)

@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_dashboard_stats(request):
    try:
        # Count users with the role 'user'
        user_count = User.objects.filter(role='user').count()
        print("hello", user_count)
        
        # Calculate total net profit (assuming net profit is stored in Profit)
        total_net_profit = Profit.objects.aggregate(Sum('net_profit'))['net_profit__sum'] or 0
        print("hello", total_net_profit)

        # Count total jobs
        total_jobs = Job.objects.count()
        print("hello", total_jobs)

        # Count subscriptions
        total_subscriptions = Subscription.objects.count()
        print("hello", total_subscriptions)

        # Jobs by Category (assuming 'skills' field in Job model)
        jobs_by_category = Job.objects.values('skills').annotate(count=Count('id')).order_by('skills')
        print("hello", jobs_by_category)

        # Jobs by Preference (assuming 'employment_type' field in Job model)
        jobs_by_preference = Job.objects.values('employment_type').annotate(count=Count('employment_type'))
        print("hello", jobs_by_preference)

        # Jobs by Workplace (assuming 'workplace_type' field in Job model)
        jobs_by_workplace = Job.objects.values('workplace_type').annotate(count=Count('id')).order_by('workplace_type')
        print("hello", jobs_by_workplace)

        # User Signups (count jobs grouped by month)
        jobs_post = Job.objects.annotate(day=TruncDate('created_at')) \
    .values('day') \
    .annotate(count=Count('id')) \
    .order_by('day')

# Formatting the result to show the week in YYYY-WW format and the job count

        # Convert aggregated data to dictionaries that match the expected format
        jobs_by_category_data = [{'skills': item['skills'], 'count': item['count']} for item in jobs_by_category]
        jobs_by_preference_data = [{'employment_type': item['employment_type'], 'count': item['count']} for item in jobs_by_preference]
        jobs_by_workplace_data = [{'workplace_type': item['workplace_type'], 'count': item['count']} for item in jobs_by_workplace]
        
        # Convert the 'month' to a string format that the response can handle
        jobs_post_data = [{'day': item['day'].strftime('%Y-%m-%d'), 'count': item['count']} for item in jobs_post]        
        print("hello", jobs_post)

        

        # Prepare the response data directly without serialization
        response_data = {
            'user_count': user_count,
            'total_net_profit': total_net_profit,
            'total_jobs': total_jobs,
            'total_subscriptions': total_subscriptions,
            'jobs_by_category': jobs_by_category_data,
            'jobs_by_preference': jobs_by_preference_data,
            'jobs_by_workplace': jobs_by_workplace_data,
            'Jobs_post': jobs_post_data,
        }
        print("hello", response_data)

        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        # Log the detailed error message for debugging
        logger.error(f"Error occurred: {str(e)}", exc_info=True)

        return Response(
            {'error': 'An unexpected error occurred', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
