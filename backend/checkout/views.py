import stripe
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from getUserData.JWT import CustomJWTAuthentication
from signup.models import User,Profit
from signup.models import Subscription
import logging

# Set up logging
logger = logging.getLogger(__name__)

# Set Stripe secret key
stripe.api_key = settings.STRIPE_TEST_SECRET_KEY  # Ensure you set this key correctly in settings.py

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def create_checkout_session(request):
    try:
        print("Received request:", request.data)  # Log the incoming request
        user = request.user
        job_id = request.data.get('job_id')  # Retrieve job_id from request data
        interview_type = request.data.get('interview_type', 'ai')

        if not job_id:
            print("No job_id provided, using default success URL")

        metadata = {
            'user_id': user.id,
            'email': user.email,
            'interview_type': interview_type,
            'job_id': job_id  # Include job_id in metadata if available
        }

        # Build success URL based on whether job_id is provided
        if job_id:
            success_url = f'http://localhost:3000/Users/Posts/{job_id}/?session_id={{CHECKOUT_SESSION_ID}}'
        else:
            success_url = 'http://localhost:3000/Users/Posts/CreateJob?session_id={CHECKOUT_SESSION_ID}'

        # Create Stripe Checkout session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': 'AI Interview (Paid)',
                    },
                    'unit_amount': 5000,  # Example price in cents
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=success_url,  # Use the dynamic success URL
            cancel_url='http://localhost:3000/Users/Posts',
            metadata=metadata
        )

        print("Checkout session created:", checkout_session)  # Log the checkout session

        # After successful creation of checkout session, increment the profit
        increment_profit_by_50()

        return Response({'sessionId': checkout_session.id}, status=status.HTTP_200_OK)

    except Exception as e:
        print("Error:", str(e))  # Log any error
        return Response({'error': 'An unexpected error occurred', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from decimal import Decimal

def increment_profit_by_50():
    try:
        # Try to get the profit entry
        profit = Profit.objects.get(id=1)
        # Increment the net profit by 50 (use Decimal for accuracy)
        profit.net_profit += Decimal('50.00')
        profit.save()
        print("Profit updated successfully:", profit.net_profit)
    except Profit.DoesNotExist:
        # If no entry exists, create one with the initial profit value
        profit = Profit.objects.create(id=1, net_profit=Decimal('50.00'))
        print("Profit entry created with initial value:", profit.net_profit)
    except Exception as e:
        print("Error updating profit:", str(e))


@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    session_id = request.data.get('session_id')

    if not session_id:
        return Response({'error': 'Session ID is required'}, status=400)

    try:
        # Retrieve the session using the session ID
        session = stripe.checkout.Session.retrieve(session_id)

        if session.payment_status == 'paid':
            # Payment was successful, now update the user in the database
            user_id = session.metadata.get('user_id')
            interview_type = session.metadata.get('interview_type')

            if not user_id:
                return Response({'error': 'User ID is missing from session metadata'}, status=400)

            # Try to fetch the user based on user_id
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({'error': f'User with ID {user_id} does not exist'}, status=404)

            user.interview_type = interview_type  # Update the interview type as AI
            user.save()

            # Insert data into the Subscription table
            current_date = timezone.now().date()
            end_date = current_date + timedelta(days=30)  # Set the end date to 30 days later

            # Create a new subscription or update existing subscription
            subscription, created = Subscription.objects.get_or_create(user=user, defaults={
                'start_date': current_date,
                'end_date': end_date,
                'type': 'ai',  # Set interview type as 'ai'
            })

            if not created:
                subscription.start_date = current_date
                subscription.end_date = end_date
                subscription.type = 'ai'
                subscription.save()

            return Response({'status': 'Payment successful, user updated, subscription created'})

        else:
            return Response({'error': 'Payment not successful'}, status=400)

    except stripe.error.StripeError as e:
        return Response({'error': str(e)}, status=400)
    
    except Exception as e:
        return Response({'error': 'An unexpected error occurred', 'details': str(e)}, status=500)
