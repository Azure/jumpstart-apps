import time
import json
import random
import threading
from abc import ABC, abstractmethod
from typing import Dict, Any, List
import paho.mqtt.client as mqtt

class Topic(ABC):
    def __init__(
        self,
        broker_url: str,
        broker_port: int,
        username: str,
        password: str,
        topic_url: str,
        topic_data: List[Dict[str, Any]],
        retain_probability: float,
    ):
        self.broker_url = broker_url
        self.broker_port = broker_port
        self.username = username
        self.password = password
        self.topic_url = topic_url
        self.topic_data = topic_data
        self.retain_probability = retain_probability
        self.client = None

    def connect(self) -> None:
        """Connect to the MQTT broker."""
        # Specify the callback API version for compatibility with paho-mqtt version 2.0+
        self.client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1, self.topic_url, clean_session=True, transport="tcp")
        self.client.on_publish = self.on_publish
        self.client.username_pw_set(self.username, self.password)
        self.client.connect(self.broker_url, self.broker_port)
        self.client.loop_start()

    @abstractmethod
    def run(self) -> None:
        """Abstract method to run the topic."""
        pass

    def disconnect(self) -> None:
        """Disconnect from the MQTT broker."""
        if self.client is not None:
            self.client.loop_stop()
            self.client.disconnect()

    def on_publish(self, client, userdata, result) -> None:
        """Callback triggered when a message is published."""
        print(f'[{time.strftime("%H:%M:%S")}] Data published on: {self.topic_url}')

    def publish(self, payload: Dict[str, Any]) -> None:
        """Publish a payload to the MQTT broker."""
        self.client.publish(
            topic=self.topic_url,
            payload=json.dumps(payload),
            qos=2,
            retain=False,
        )

class TopicAuto(Topic, threading.Thread):
    def __init__(
        self,
        broker_url: str,
        broker_port: int,
        username: str,
        password: str,
        topic_url: str,
        topic_data: List[Dict[str, Any]],
        retain_probability: float,
        time_interval: int,
    ):
        Topic.__init__(self, broker_url, broker_port, username, password, topic_url, topic_data, retain_probability)
        threading.Thread.__init__(self)
        self.time_interval = time_interval
        self.old_payload = None

    def run(self) -> None:
        """Continuously generate and publish data at the specified time interval."""
        self.connect()
        try:
            while True:
                payload = self.generate_data()
                self.publish(payload)
                time.sleep(self.time_interval)
        finally:
            self.disconnect()

    def generate_data(self) -> Dict[str, Any]:
        """Generate the next payload."""
        if self.old_payload is None:
            payload = self._generate_initial_data()
        else:
            payload = self._generate_next_data()
        self.old_payload = payload
        return payload

    def _generate_initial_data(self) -> Dict[str, Any]:
        """Generate initial data payload."""
        payload = {}
        for data in self.topic_data:
            if data["TYPE"] == "int":
                payload[data["NAME"]] = random.randint(data["MIN_VALUE"], data["MAX_VALUE"])
            elif data["TYPE"] == "float":
                payload[data["NAME"]] = random.uniform(data["MIN_VALUE"], data["MAX_VALUE"])
            elif data["TYPE"] == "bool":
                payload[data["NAME"]] = random.choice([True, False])
        return payload

    def _generate_next_data(self) -> Dict[str, Any]:
        """Generate the next data payload based on previous data."""
        payload = self.old_payload.copy()
        for data in self.topic_data:
            if random.random() <= self.retain_probability:
                continue
            if data["TYPE"] == "bool":
                payload[data["NAME"]] = not payload[data["NAME"]]
            else:
                step = random.uniform(-data["MAX_STEP"], data["MAX_STEP"])
                if data["TYPE"] == "int":
                    step = round(step)
                payload[data["NAME"]] = self._apply_step(payload[data["NAME"]], step, data)
        return payload

    @staticmethod
    def _apply_step(current_value: float, step: float, data: Dict[str, Any]) -> float:
        """Apply the step to the current value, respecting min and max bounds."""
        if step < 0:
            return max(current_value + step, data["MIN_VALUE"])
        else:
            return min(current_value + step, data["MAX_VALUE"])