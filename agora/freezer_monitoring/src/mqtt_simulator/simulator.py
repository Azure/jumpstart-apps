import json
from pathlib import Path
from typing import List, Dict, Any
from topic import TopicAuto

class Simulator:
    def __init__(self, settings_file: Path):
        self.broker_url: str = ""
        self.broker_port: int = 0
        self.username: str = ""
        self.password: str = ""
        self.topics: List[TopicAuto] = []
        self.load_settings(settings_file)

    def load_settings(self, settings_file: Path) -> None:
        """Load configuration settings from the given JSON file."""
        with open(settings_file, 'r') as json_file:
            config = json.load(json_file)
            self.broker_url = config["BROKER_URL"]
            self.broker_port = config["BROKER_PORT"]
            self.username = config["MQTT_USERNAME"]
            self.password = config["MQTT_PASSWORD"]

            for topic_config in config["TOPICS"]:
                self._create_topics(topic_config)

    def _create_topics(self, topic_config: Dict[str, Any]) -> None:
        """Create topics based on the configuration."""
        topic_data = topic_config["DATA"]
        topic_time_interval = topic_config["TIME_INTERVAL"]
        topic_retain_probability = topic_config["RETAIN_PROBABILITY"]

        if topic_config["TYPE"] == "single":
            self._add_topic(
                topic_config["PREFIX"], topic_data, topic_retain_probability, topic_time_interval
            )
        elif topic_config["TYPE"] == "multiple":
            for id in range(topic_config["RANGE_START"], topic_config["RANGE_END"] + 1):
                topic_url = f"{topic_config['PREFIX']}/{id}"
                self._add_topic(topic_url, topic_data, topic_retain_probability, topic_time_interval)
        elif topic_config["TYPE"] == "list":
            for item in topic_config["LIST"]:
                topic_url = f"{topic_config['PREFIX']}/{item}"
                self._add_topic(topic_url, topic_data, topic_retain_probability, topic_time_interval)

    def _add_topic(self, topic_url: str, data: Any, retain_probability: float, time_interval: int) -> None:
        """Helper function to add a topic to the topics list."""
        topic = TopicAuto(
            self.broker_url,
            self.broker_port,
            self.username,
            self.password,
            topic_url,
            data,
            retain_probability,
            time_interval,
        )
        self.topics.append(topic)

    def run(self) -> None:
        """Start all topics."""
        for topic in self.topics:
            print(f"Starting: {topic.topic_url} ...")
            topic.start()

    def stop(self) -> None:
        """Stop all topics."""
        for topic in self.topics:
            print(f"Stopping: {topic.topic_url} ...")
            topic.stop()