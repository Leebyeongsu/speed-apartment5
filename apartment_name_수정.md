# 아파트명 동적 관리 기능 구현 가이드

## 📋 개요

현재 시스템은 아파트명이 `'Speed 아파트'`로 하드코딩되어 있습니다. 이를 Supabase 데이터베이스에서 동적으로 관리할 수 있도록 수정하는 방법을 설명합니다.

## 🔍 현재 상태 분석

### 하드코딩된 위치
- `script.js:610` - EmailJS 파라미터 설정
- `script.js:805` - EmailJS 파라미터 설정
- `script.js:827` - 에러 로깅용 파라미터

### EmailJS 템플릿에서 사용
```
메일 제목: [{{apartment_name}}] 새 통신환경개선 신청서 - {{application_number}}
결과: [Speed 아파트] 새 통신환경개선 신청서 - 202509142017
```

## 🛠️ 구현 단계

### 1단계: 데이터베이스 스키마 수정

#### Supabase SQL 콘솔에서 실행:
```sql
-- admin_settings 테이블에 apartment_name 컬럼 추가
ALTER TABLE admin_settings
ADD COLUMN apartment_name TEXT DEFAULT 'Speed 아파트';

-- 기존 레코드에 기본값 설정
UPDATE admin_settings
SET apartment_name = 'Speed 아파트'
WHERE apartment_id = 'speed_apartment2';
```

#### 확인 쿼리:
```sql
SELECT apartment_id, apartment_name, title, subtitle
FROM admin_settings
WHERE apartment_id = 'speed_apartment2';
```

### 2단계: JavaScript 코드 수정

#### A. loadAdminSettings() 함수 수정
```javascript
// 현재 코드에서 apartment_name 필드 추가 조회
async function loadAdminSettings() {
    try {
        const { data, error } = await supabase
            .from('admin_settings')
            .select('title, subtitle, phones, emails, apartment_name') // apartment_name 추가
            .eq('apartment_id', APARTMENT_ID)
            .single();

        if (error) throw error;

        // apartment_name 전역 변수에 저장
        window.currentApartmentName = data.apartment_name || 'Speed 아파트';

        // 기존 로직 유지...
    } catch (error) {
        console.error('관리자 설정 로드 실패:', error);
        // fallback 값 설정
        window.currentApartmentName = 'Speed 아파트';
    }
}
```

#### B. EmailJS 파라미터 수정
```javascript
// 하드코딩된 부분들을 동적 값으로 변경

// 1. 첫 번째 위치 (라인 610 근처)
const templateParams = {
    to_email: adminEmail,
    apartment_name: window.currentApartmentName || 'Speed 아파트', // 수정
    application_number: emailAppNumber,
    // ... 나머지 파라미터
};

// 2. 두 번째 위치 (라인 805 근처)
const result = await emailjs.send(
    'service_v90gm26',
    'template_pxi385c',
    {
        to_email: email,
        apartment_name: window.currentApartmentName || 'Speed 아파트', // 수정
        application_number: emailAppNum,
        // ... 나머지 파라미터
    }
);

// 3. 에러 로깅 부분 (라인 827 근처)
console.error('📋 실패한 이메일 파라미터:', {
    to_email: email,
    apartment_name: window.currentApartmentName || 'Speed 아파트', // 수정
    application_number: emailAppNum,
    // ... 나머지 파라미터
});
```

#### C. 초기화 순서 보장
```javascript
// DOMContentLoaded 이벤트에서 순서 보장
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await testSupabaseConnection();
        await initializeEmailJS();
        await loadAdminSettings(); // apartment_name 로드

        // 나머지 초기화...
    } catch (error) {
        console.error('초기화 실패:', error);
    }
});
```

### 3단계: 관리자 UI 추가 (선택사항)

#### HTML 폼에 아파트명 입력 필드 추가:
```html
<div class="form-group">
    <label for="apartmentName">아파트명:</label>
    <input type="text" id="apartmentName" placeholder="예: Speed 아파트" maxlength="50">
</div>
```

#### 저장 기능 구현:
```javascript
async function saveApartmentName() {
    const apartmentName = document.getElementById('apartmentName').value.trim();

    if (!apartmentName) {
        alert('아파트명을 입력해주세요.');
        return;
    }

    try {
        const { error } = await supabase
            .from('admin_settings')
            .upsert({
                apartment_id: APARTMENT_ID,
                apartment_name: apartmentName
            });

        if (error) throw error;

        // 전역 변수 업데이트
        window.currentApartmentName = apartmentName;
        alert('아파트명이 저장되었습니다.');

    } catch (error) {
        console.error('아파트명 저장 실패:', error);
        alert('저장에 실패했습니다.');
    }
}
```

## 🎯 사용 방법

### 관리자가 아파트명을 변경하는 방법:

#### 방법 1: 직접 데이터베이스 수정
```sql
UPDATE admin_settings
SET apartment_name = '새로운 아파트명'
WHERE apartment_id = 'speed_apartment2';
```

#### 방법 2: 관리자 UI 사용 (구현 후)
1. 관리자 패널 접속
2. 아파트명 입력 필드에 새 이름 입력
3. 저장 버튼 클릭

### 결과 확인:
- 이메일 제목이 `[새로운 아파트명] 새 통신환경개선 신청서 - 신청번호` 형태로 변경됨

## ⚠️ 주의사항

### 배포 안전성
- ✅ 기존 배포된 웹에 영향 없음
- ✅ 점진적 배포 가능 (데이터베이스 → 코드 순서로)
- ✅ 롤백 가능 (컬럼 제거만 하면 됨)

### 에러 처리
- 데이터베이스 조회 실패 시 기본값 `'Speed 아파트'` 사용
- `apartment_name`이 null이거나 빈 문자열일 때 기본값 적용
- 네트워크 오류 시에도 기본값으로 fallback

### 성능 고려
- `loadAdminSettings()` 함수가 한 번만 호출되므로 성능 영향 미미
- 전역 변수 캐싱으로 추가 쿼리 불필요

## 🔧 테스트 계획

### 단계별 테스트:

1. **데이터베이스 테스트**
   ```sql
   -- 컬럼 추가 확인
   SELECT apartment_name FROM admin_settings WHERE apartment_id = 'speed_apartment2';
   ```

2. **코드 수정 테스트**
   ```javascript
   console.log('현재 아파트명:', window.currentApartmentName);
   ```

3. **이메일 테스트**
   - 테스트 신청서 제출
   - 이메일 제목 확인: `[설정된 아파트명] 새 통신환경개선 신청서 - 신청번호`

4. **Fallback 테스트**
   - 데이터베이스에서 `apartment_name`을 null로 설정
   - 기본값 `'Speed 아파트'`가 사용되는지 확인

## 🚀 배포 순서

1. **Supabase에서 컬럼 추가** (영향 없음)
2. **기본값 설정** (안전함)
3. **JavaScript 코드 배포** (점진적 향상)
4. **테스트 및 검증**
5. **관리자 UI 추가** (선택사항)

이 구현을 통해 아파트명을 동적으로 관리할 수 있으며, 다른 아파트 단지에서도 동일한 시스템을 쉽게 재사용할 수 있습니다.