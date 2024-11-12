from prometheus_client import Gauge, Counter

class PrometheusMetrics:
    def __init__(self):
        # Basic metrics with camera label
        self.total_persons = Gauge('detected_total_persons', 'Total number of detected persons', ['camera'])
        self.total_shoppers = Gauge('total_shoppers', 'Total number of shoppers', ['camera'])
        self.current_shoppers = Gauge('current_shoppers', 'Current number of shoppers', ['camera'])
        self.fps = Gauge('detection_fps', 'Current FPS of detection system', ['camera'])
        self.time_in_area_avg = Gauge('time_in_area_avg', 'Average time shoppers spend in an area', ['camera', 'area_id'])
        
        # Gauges for age demographics per camera
        self.age_groups = {}
        for age in [10, 20, 30, 40, 50, 60]:
            self.age_groups[f'age_{age}'] = 0
        
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
            self.total_shoppers.labels(camera=camera_name).set(detection_data['total_shoppers'])
            self.current_shoppers.labels(camera=camera_name).set(detection_data['current_shopper'])
            self.fps.labels(camera=camera_name).set(detection_data['fps'])
            
            # Update age metrics
            for age, count in detection_data['age_stats'].items():
                metric = self._get_age_metric(age, camera_name)
                metric.labels(camera=camera_name).set(count)
            
            # Update area statistics
            for area_id, stats in detection_data['area_stats'].items():
                metric = self._get_area_metric(area_id, camera_name)
                metric.labels(camera=camera_name).set(stats['current_count'])
                metric.labels(camera=camera_name).set(stats['total_count'])

            # Update time inside area metrics
            for area_id, times in detection_data['people_near_areas'].items():
                metric_key = f'time_in_area_{area_id}_{camera_name}'
                if metric_key not in self.area_stats:
                    self.area_stats[metric_key] = Gauge(
                        f'time_in_area_{area_id}_{camera_name.replace(" ", "_")}',
                        f'Time spent in area {area_id}',
                        ['camera']
                    )
                metric = self.area_stats[metric_key]
                metric.labels(camera=camera_name).set(times[0]['end_time'] - times[0]['start_time'])
                
            # Update average time in area metrics
            for area_id, times in detection_data['people_near_areas'].items():
                if not times or len(times) == 0:
                    continue
                total_time = sum(time.get('end_time', 0) - time.get('start_time', 0) for time in times if isinstance(time, dict))
                total_entries = len(times)
                average_time = total_time / total_entries if total_entries > 0 else 0
                self.time_in_area_avg.labels(camera=camera_name, area_id=area_id).set(average_time)