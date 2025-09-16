import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Clock } from 'lucide-react';

function App() {
  console.log('🔥 App 컴포넌트 실행!');
  
  // 상태 관리
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({ name: '', content: '' });

  // API Base URL
  const API_BASE = 'http://localhost:8080/api';

  // 코스 목록 조회
  const fetchCourses = async () => {
    console.log('🔥 fetchCourses 함수 실행!');
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/courses`);
      console.log('📨 API 응답:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ 받은 데이터:', data);
        setCourses(data);
      } else {
        console.error('❌ API 호출 실패:', response.status);
        alert(`API 호출 실패: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ 네트워크 에러:', error);
      alert('서버 연결 실패! Spring Boot 서버가 실행 중인지 확인하세요.');
    } finally {
      setLoading(false);
    }
  };

  // 새 코스 추가
  const addCourse = async (courseData) => {
    console.log('📤 코스 추가 요청:', courseData);
    try {
      const response = await fetch(`${API_BASE}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });
      
      console.log('📨 추가 응답:', response.status);
      
      if (response.ok) {
        console.log('✅ 코스 추가 성공!');
        await fetchCourses(); // 목록 새로고침
        resetForm();
        alert('코스가 성공적으로 추가되었습니다!');
      } else {
        console.error('❌ 코스 추가 실패:', response.status);
        alert(`코스 추가 실패: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ 추가 네트워크 에러:', error);
      alert('서버 연결 실패!');
    }
  };

  // 코스 수정
  const updateCourse = async (id, courseData) => {
    console.log('📝 코스 수정 요청:', id, courseData);
    try {
      const response = await fetch(`${API_BASE}/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });
      
      console.log('📨 수정 응답:', response.status);
      
      if (response.ok) {
        console.log('✅ 코스 수정 성공!');
        await fetchCourses(); // 목록 새로고침
        resetForm();
        alert('코스가 성공적으로 수정되었습니다!');
      } else {
        console.error('❌ 코스 수정 실패:', response.status);
        alert(`코스 수정 실패: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ 수정 네트워크 에러:', error);
      alert('서버 연결 실패!');
    }
  };

  // 코스 삭제
  const deleteCourse = async (id) => {
    if (!window.confirm('정말로 이 코스를 삭제하시겠습니까?')) return;
    
    console.log('🗑️ 코스 삭제 요청:', id);
    try {
      const response = await fetch(`${API_BASE}/courses/${id}`, {
        method: 'DELETE',
      });
      
      console.log('📨 삭제 응답:', response.status);
      
      if (response.ok) {
        console.log('✅ 코스 삭제 성공!');
        await fetchCourses(); // 목록 새로고침
        alert('코스가 성공적으로 삭제되었습니다!');
      } else {
        console.error('❌ 코스 삭제 실패:', response.status);
        alert(`코스 삭제 실패: ${response.status}`);
        console.log('data id', id)
      }
    } catch (error) {
      console.error('❌ 삭제 네트워크 에러:', error);
      alert('서버 연결 실패!');
    }
  };

  // 폼 제출 처리
  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      alert('코스명과 설명을 모두 입력해주세요.');
      return;
    }

    console.log('📝 폼 제출:', formData);

    if (editingCourse) {
      updateCourse(editingCourse.id, formData);
    } else {
      addCourse(formData);
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setFormData({ name: '', content: '' });
    setShowForm(false);
    setEditingCourse(null);
  };

  // 수정 시작
  const startEdit = (course) => {
    console.log('✏️ 수정 시작:', course);
    setEditingCourse(course);
    setFormData({ name: course.name, content: course.content });
    setShowForm(true);
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    console.log('🚀 useEffect 실행! fetchCourses 호출');
    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <MapPin className="text-blue-600" size={40} />
            런쉐어 코스 관리
          </h1>
          <p className="text-gray-600">나만의 달리기 코스를 추가하고 관리하세요</p>
        </div>

        {/* 코스 추가 버튼 */}
        <div className="mb-6">
          <button
            onClick={() => {
              console.log('➕ 새 코스 추가 버튼 클릭');
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-md transition-colors"
          >
            <Plus size={20} />
            새 코스 추가
          </button>
        </div>

        {/* 코스 추가/수정 폼 */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-blue-600">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {editingCourse ? '코스 수정' : '새 코스 추가'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  코스명
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    // console.log('📝 코스명 입력:', e.target.value);
                    setFormData({ ...formData, name: e.target.value });
                  }}
                  placeholder="예: 한강 러닝 코스"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  코스 설명
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => {
                    // console.log('📝 설명 입력:', e.target.value);
                    setFormData({ ...formData, content: e.target.value });
                  }}
                  placeholder="코스에 대한 상세한 설명을 입력하세요..."
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {editingCourse ? '수정하기' : '추가하기'}
                </button>
                <button
                  onClick={() => {
                    console.log('❌ 취소 버튼 클릭');
                    resetForm();
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 로딩 상태 */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">로딩 중...</p>
          </div>
        )}

        {/* 코스 목록 */}
        <div className="space-y-4">
          {!loading && courses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">아직 등록된 코스가 없습니다</h3>
              <p className="text-gray-600 mb-4">첫 번째 달리기 코스를 추가해보세요!</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                코스 추가하기
              </button>
            </div>
          ) : (
            courses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{course.name}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{course.content}</p>
                    <div className="flex items-center text-sm text-gray-500 gap-4">
                      <span className="flex items-center gap-1">
                        <Clock size={16} />
                        ID: {course.id}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        console.log('✏️ 수정 버튼 클릭:', course);
                        startEdit(course);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="수정"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => {
                        console.log('🗑️ 삭제 버튼 클릭:', course);
                        deleteCourse(course.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="삭제"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 성공 안내 */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-2">/api/courses 로 조회한 test</h4>
        </div>
      </div>
    </div>
  );
}

export default App;