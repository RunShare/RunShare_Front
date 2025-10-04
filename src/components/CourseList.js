import React from 'react';
import './CourseList.css';

function CourseList({ courses, onCourseClick }) {
  if (!courses || courses.length === 0) {
    return <div className="no-courses">추천 코스가 없습니다.</div>;
  }

  const getLevelText = (level) => {
    switch (level) {
      case 'BEGINNER':
        return '초급';
      case 'INTERMEDIATE':
        return '중급';
      case 'ADVANCED':
        return '고급';
      default:
        return level;
    }
  };

  return (
    <div className="course-list">
      {courses.map((course) => (
        <div
          key={course.gpxId}
          className="course-item"
          onClick={() => onCourseClick(course.gpxId)}
        >
          <div className="course-header">
            <h3>{course.name}</h3>
            <span className={`level-badge ${course.level.toLowerCase()}`}>
              {getLevelText(course.level)}
            </span>
          </div>
          <div className="course-details">
            <div className="detail-item">
              <span className="label">거리:</span>
              <span className="value">{course.distance.toFixed(1)} km</span>
            </div>
            <div className="detail-item">
              <span className="label">고도 변화:</span>
              <span className="value">{course.altitude.toFixed(0)} m</span>
            </div>
            <div className="detail-item">
              <span className="label">시작점까지:</span>
              <span className="value">{course.distanceFromUser.toFixed(1)} km</span>
            </div>
          </div>
          <div className="course-location">
            <span>📍 {course.startLat.toFixed(4)}, {course.startLon.toFixed(4)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CourseList;