import React from 'react';

function CourseList({ courses, onCourseClick, onDeleteCourse }) {
  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <p className="text-gray-600 text-lg">추천 코스가 없습니다</p>
      </div>
    );
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

  const getLevelColor = (level) => {
    switch (level) {
      case 'BEGINNER':
        return 'bg-gray-100 text-gray-800';
      case 'INTERMEDIATE':
        return 'bg-blue-100 text-blue-800';
      case 'ADVANCED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {courses.map((course) => (
        <div
          key={course.gpxId}
          className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group relative"
          onClick={() => onCourseClick(course.gpxId)}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-black transition-colors">
                {course.name}
              </h3>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getLevelColor(course.level)}`}>
                {getLevelText(course.level)}
              </span>
            </div>
            <button
              className="p-2 hover:bg-red-50 rounded-full transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCourse(course.gpxId);
              }}
            >
              <svg className="w-5 h-5 text-gray-400 hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="text-sm text-gray-600">거리</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{course.distance.toFixed(1)} km</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span className="text-sm text-gray-600">고도 변화</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{course.altitude.toFixed(0)} m</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-gray-600">시작점까지</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{course.distanceFromUser.toFixed(1)} km</span>
            </div>
          </div>

          {/* Location */}
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="truncate">
                {course.startLat.toFixed(4)}, {course.startLon.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Hover Arrow */}
          <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CourseList;