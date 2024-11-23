from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Sum
from django.db.models.functions import TruncMonth,TruncWeek,TruncDate
from signup.models import  User, Profile, Candidate, Recruiter, Subscription, Job,Profit
from getUserData.JWT import CustomJWTAuthentication
from rest_framework.permissions import IsAuthenticated
import logging
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q


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


#Delete user
class UserPagination(PageNumberPagination):
    page_size = 10  # Default number of items per page
    page_size_query_param = 'page_size'
    max_page_size = 100

@api_view(['GET'])
@authentication_classes([])  # No authentication
@permission_classes([])  # No permission checks
def load_users(request):
    try:
        # Get the role and email filters from query parameters
        role = request.query_params.get('role')  # Optional role filter
        email = request.query_params.get('email')  # Optional email filter

        # Base query: Only include users with the role 'user'
        users = User.objects.filter(role='user')

        # Apply additional filters if provided
        if role:
            users = users.filter(role=role)
        if email:
            users = users.filter(email__icontains=email)  # Case-insensitive email filter

        # Total count of filtered users
        total_count = users.count()

        # Paginate results
        paginator = UserPagination()
        result_page = paginator.paginate_queryset(users, request)

        # Prepare response data
        users_data = [
            {
                'id': user.id,
                'email': user.email,
                'role': user.role,
                'total_count': total_count,  # Include total count in each user data
                'is_active': user.is_active,
            }
            for user in result_page
        ]

        # Return paginated response
        return paginator.get_paginated_response(users_data)

    except Exception as e:
        return Response({'error': 'Error loading users', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@authentication_classes([])  # No authentication
@permission_classes([])  # No permission checks
def delete_user(request, user_id):
    """
    API for admin to delete a user by ID and all related data.
    """
    print(user_id)
    try:
        # Ensure the requester is an admin
        print("user_id2",user_id)

      #  if request.user.role != 'admin':
       #     print("I am here3",user_id)
        #    return Response({'error': 'Only admins can delete users'}, status=status.HTTP_403_FORBIDDEN)

        # Fetch the user by ID
        print("I am here4",user_id)
        user = User.objects.filter(id=user_id).first()
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Prevent deleting themselves
        if user == request.user:
            return Response({'error': 'Admins cannot delete their own account'}, status=status.HTTP_400_BAD_REQUEST)

        # Start deleting associated data
        print("Deleting Profile")
        Profile.objects.filter(user=user).delete()

        print("Deleting Candidate")
        Candidate.objects.filter(profile__user=user).delete()

        print("Deleting Recruiter")
        Recruiter.objects.filter(profile__user=user).delete()

        print("Deleting Subscription")
        Subscription.objects.filter(user=user).delete()

        print("Deleting Jobs")
        Job.objects.filter(recruiter__profile__user=user).delete()

        # Finally, delete the user
        user.delete()

        return Response({'message': f'User with ID {user_id} and all related data have been deleted'}, status=status.HTTP_200_OK)
    except Exception as e:
        print(f"Error: {e}")
        return Response({'error': 'Error deleting user', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


#subscription
@api_view(['GET'])
@authentication_classes([])  # No authentication
@permission_classes([])  # No permission checks
def subscribers(request):
    try:
        # Get the email filter and page number from query parameters
        email_filter = request.GET.get('email', None)
        page = int(request.GET.get('page', 1))  # Get the page number, default to 1 if not provided

        # Base query: Include all subscriptions initially
        subs = Subscription.objects.all()

        # Apply email filter if provided
        if email_filter:
            subs = subs.filter(user__email__icontains=email_filter)  # Case-insensitive email filter

        # Total count of filtered subscriptions
        total_count = subs.count()

        # Paginate results using the custom UserPagination class
        paginator = UserPagination()  # Custom pagination class
        result_page = paginator.paginate_queryset(subs, request)

        # Calculate total pages based on total_count
        total_pages = (total_count + paginator.page_size - 1) // paginator.page_size  # Round up division for total pages

        # Prepare response data
        subscriptions_data = [
            {
                'id': subscription.id,
                'email': subscription.user.email,
                'subscription': subscription.type,
            }
            for subscription in result_page
        ]

        # Prepare the response with pagination metadata
        response_data = {
            'results': subscriptions_data,
            'total_count': total_count,
            'total_pages': total_pages,
            'current_page': page,  # Current page should reflect the requested page number
        }

        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': 'Error loading subscriptions', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@authentication_classes([])  # No authentication
@permission_classes([])  # No permission checks
def delete_subscription(request, subscription_id):
    try:
        print("Hello",subscription_id)
        # Fetch the subscription by ID
        subscription = Subscription.objects.get(id=subscription_id)
        
        # Delete the subscription
        subscription.delete()

        # Return a success response
        return Response({'detail': 'Subscription deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

    except Subscription.DoesNotExist:
        # Handle case where subscription is not found
        return Response({'detail': 'Subscription not found'}, status=status.HTTP_404_NOT_FOUND)