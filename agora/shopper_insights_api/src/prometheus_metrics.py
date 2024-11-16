from prometheus_client import Gauge, Counter

class PrometheusMetrics:
    def __init__(self):
        # Basic metrics with camera label
        self.total_persons = Gauge('detected_total_persons', 'Total number of detected persons', ['camera'])
        self.total_shoppers = Gauge('total_shoppers', 'Total number of shoppers', ['camera'])
        self.current_shoppers = Gauge('current_shoppers', 'Current number of shoppers', ['camera'])
        self.time_in_area_avg_age = Gauge('time_in_area_avg_age', 'Average time spent in area', ['camera'])
        self.fps = Gauge('detection_fps', 'Current FPS of detection system', ['camera'])
        
        # Gauges for age demographics per camera
        self.age_groups = {}

        # Gauges for average time spent in area per age group per camera
        self.time_in_area_avg_age = {}

        # Gauges for area statistics per camera
        self.area_stats = {}
        self.people_near_areas = {}
   
    def _get_age_metric(self, age, camera_name):
        """Get or create an age metric for a specific camera."""
        metric_key = f'age_{age}_{camera_name.replace(" ", "_")}'
        if metric_key not in self.age_groups:
            self.age_groups[metric_key] = Gauge(
                f'shoppers_age_{age}_{camera_name.replace(" ", "_")}',
                f'Number of shoppers in age group {age}',
                ['camera']
            )

        for age_group in [10, 20, 30, 40, 50, 60]:
            aux_metric_key = f'age_{age_group}_{camera_name.replace(" ", "_")}'
            if aux_metric_key not in self.age_groups:
                self.age_groups[aux_metric_key] = Gauge(
                    f'shoppers_age_{age_group}_{camera_name.replace(" ", "_")}',
                    f'Number of shoppers in age group {age_group}',
                    ['camera']
                )
                self.age_groups[aux_metric_key].labels(camera=camera_name).set(0)
        
        for age_group in [10, 20, 30, 40, 50, 60]:
            aux_metric_key = f'time_avg_age_{age_group}_{camera_name.replace(" ", "_")}'
            if aux_metric_key not in self.time_in_area_avg_age:
                self.time_in_area_avg_age[aux_metric_key] = Gauge(
                    f'time_avg_age_{age_group}_{camera_name.replace(" ", "_")}',
                    f'Average time spent by shoppers in age group {age_group}',
                    ['camera']
                )
                self.time_in_area_avg_age[aux_metric_key].labels(camera=camera_name).set(0)
                
        return self.age_groups[metric_key]
    
    def _get_area_metric(self, area_id, camera_name):
        """Get or create an area metric for a specific camera."""
        metric_key = f'area_{area_id}_{camera_name.replace(" ", "_")}'
        if metric_key not in self.area_stats:
            self.area_stats[metric_key] = Gauge(
                f'area_stats_{area_id}_{camera_name.replace(" ", "_")}',
                f'Statistics for area {area_id}',
                ['camera']
            )
        return self.area_stats[metric_key]
    
    def _get_proximity_metric(self, person_id, area_id, camera_name):
        """Get or create a proximity metric for a specific camera."""
        metric_key = f'person_{person_id}_area_{area_id}_{camera_name.replace(" ", "_")}'
        if metric_key not in self.people_near_areas:
            self.people_near_areas[metric_key] = Gauge(
                f'person_near_area',
                f'Person proximity to area',
                ['camera', 'person_id', 'area_id']
            )
        return self.people_near_areas[metric_key]

    def update_metrics(self, all_camera_data):
        """Update metrics for all cameras"""
        for camera_name, detection_data in all_camera_data.items():
            # Update basic metrics
            self.total_persons.labels(camera=camera_name).set(detection_data['detected_persons'])
            self.fps.labels(camera=camera_name).set(detection_data['fps'])
            
            # Update age metrics
            for age, count in detection_data['age_stats'].items():
                metric = self._get_age_metric(age, camera_name)
                metric.labels(camera=camera_name).set(count)
            
            # Update area statistics
            for area_id, stats in detection_data['area_stats'].items():
                metric = self._get_area_metric(area_id, camera_name)
                self.total_shoppers.labels(camera=camera_name).set(stats['total_count'])
                self.current_shoppers.labels(camera=camera_name).set(stats['current_count'])
                metric.labels(camera=camera_name).set(stats['current_count'])
                metric.labels(camera=camera_name).set(stats['total_count'])

            # Update average time in area metrics per age group
            for area_id, age_data in detection_data['people_near_areas'].items():
                for times in age_data.items():
                    if not times or len(times) == 0:
                        continue

                    # Calcualte the Average time spent in area - Only consider valid times if the difference is greater than 1 second
                    valid_times = [time for time in times if isinstance(time, dict) and (time.get('end_time', 0) - time.get('start_time', 0)) > 1]
                    total_time = sum(time.get('end_time', 0) - time.get('start_time', 0) for time in valid_times)
                    total_entries = len(valid_times)
                    average_time = total_time / total_entries if total_entries > 0 else 0

                    # Get the Age group of the shoppers
                    age = times[1].get('age', 0)
                    age_group = int(age // 10) * 10

                    metric_key = f'time_avg_age_{age_group}_{camera_name.replace(" ", "_")}'
                    if metric_key not in self.time_in_area_avg_age:
                        self.time_in_area_avg_age[metric_key] = Gauge(
                            f'time_avg_age_{age_group}_{camera_name.replace(" ", "_")}',
                            f'Average time spent by shoppers in age group {age_group}',
                            ['camera']
                        )
                    metric = self.time_in_area_avg_age[metric_key]
                    metric.labels(camera=camera_name).set(average_time)