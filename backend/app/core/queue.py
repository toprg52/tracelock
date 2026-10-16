import pika
import json
from backend.app.core.config import settings

def publish_job(queue_name: str, payload: dict) -> bool:
    try:
        # Parse connection parameters
        params = pika.URLParameters(settings.RABBITMQ_URL)
        connection = pika.BlockingConnection(params)
        channel = connection.channel()
        
        channel.queue_declare(queue=queue_name, durable=True)
        channel.basic_publish(
            exchange='',
            routing_key=queue_name,
            body=json.dumps(payload),
            properties=pika.BasicProperties(
                delivery_mode=2,  # make message persistent
            )
        )
        connection.close()
        return True
    except Exception as e:
        print(f"Failed to publish message to RabbitMQ: {str(e)}")
        return False
