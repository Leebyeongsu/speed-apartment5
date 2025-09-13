# CLAUDE.md

이 파일은 클로드 코드(claude.ai/code)가 이 저장소의 코드를 작업할 때 지침을 제공합니다.

## 🏗️ 아키텍처 개요

이 프로그램은 순수 자바스크립트, HTML5, CSS3로 구축된 웹 기반 아파트 통신 환경 개선 신청서 시스템입니다. 데이터 저장을 위한 Supabase, 이메일 알림을 위한 EmailJS와 통합되어 있으며, QR 코드 생성, 카카오톡 공유, 모바일 반응형 디자인을 제공합니다.

### 핵심 시스템 구성요소

**애플리케이션 스택:**
1. **프론트엔드** (`index.html`) - 모바일 우선 반응형 디자인의 단일 페이지 애플리케이션
2. **자바스크립트 코어** (`script.js`) - 폼 처리, API 통합, UI 상호작용
3. **Supabase 통합** (`supabase-config.js`) - 데이터베이스 클라이언트 설정 및 연결 관리
4. **스타일링** (`style.css`) - 그라디언트 디자인과 애니메이션을 포함한 현대적 반응형 CSS

**주요 기능:**
- **폼 관리** - 아파트 통신 환경 개선 신청서 제출
- **관리자 패널** - 이메일/전화번호 설정 및 공유용 QR 코드 생성
- **고객 모드** - 간단한 폼 제출 인터페이스 (`?mode=customer`로 활성화)
- **다채널 알림** - 이메일(EmailJS) 및 SMS 통합
- **QR 코드 생성** - 쉬운 폼 공유 및 배포
- **카카오톡 연동** - 소셜 공유 기능
- **모바일 디버깅** - 모바일 테스트를 위한 Eruda 개발자 도구

### 데이터베이스 스키마 (Supabase)

```sql
-- 관리자 설정 테이블
CREATE TABLE admin_settings (
    id SERIAL PRIMARY KEY,
    apartment_id TEXT UNIQUE NOT NULL,
    title TEXT,
    subtitle TEXT,
    phones TEXT[],
    emails TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 신청서 테이블
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    application_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    work_type TEXT,
    work_type_display TEXT,
    budget TEXT,
    budget_display TEXT,
    start_date DATE,
    description TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 관리자 알림 로그 테이블
CREATE TABLE notification_logs (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id),
    notification_type TEXT NOT NULL, -- 'sms' or 'email'
    recipient TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚀 개발 명령어

### 환경 설정
```bash
# 빌드 과정 불필요 - 정적 파일만 사용
# 로컬에서 HTTP 서버로 실행
python -m http.server 8000
# 또는
npx serve .
```

### 설정
- **Supabase URL**: `https://boorsqnfkwglzvnhtwcx.supabase.co`
- **EmailJS 사용자 ID**: `8-CeAZsTwQwNl4yE2`
- **아파트 ID**: `speed_apartment2` (script.js:4에서 설정 가능)

### 테스트 모드
```
# 일반 관리자 모드 (기본값)
http://localhost:8000/

# 고객 전용 모드
http://localhost:8000/?mode=customer

# 모바일 개발자 도구 포함 디버그 모드
http://localhost:8000/?debug=true
http://localhost:8000/#eruda
```

## 🎯 핵심 기술 개념

### 애플리케이션 모드

**관리자 모드 (기본값):**
- 이메일/전화번호 설정을 포함한 완전한 관리 인터페이스
- QR 코드 생성 및 관리
- 카카오톡 공유 기능
- 폼 제출 및 관리 도구

**고객 모드 (`?mode=customer`):**
- 신청서 폼만 표시하는 간소화된 인터페이스
- CSS와 JavaScript를 통해 관리 기능 숨김
- 최종 사용자를 위한 깔끔한 제출 환경

### 데이터 흐름 아키텍처
1. **폼 제출** → Supabase `applications` 테이블
2. **관리자 설정** → Supabase `admin_settings` 테이블
3. **이메일 알림** → EmailJS 서비스 → 관리자 수신자
4. **SMS 알림** → Supabase Edge Functions (계획 중)
5. **신청서 상태** → Supabase를 통한 실시간 업데이트

### 모바일 우선 반응형 디자인
- **뷰포트 최적화**: 모바일 입력에서 줌 방지
- **터치 친화적 UI**: 큰 버튼과 터치 대상
- **점진적 향상**: 기본 기능은 JavaScript 없이도 작동
- **모바일 디버깅**: 모바일 테스트를 위한 통합 Eruda 콘솔

### 에러 처리 및 디버깅
- **전역 에러 처리**: JavaScript 오류 포착 및 표시
- **네트워크 복원력**: API 호출 자동 재시도
- **연결 테스트**: 로드 시 Supabase 연결성 검증
- **모바일 디버그 도구**: 문제 해결을 위한 복사 가능한 오류 로그

## ⚙️ 설정 관리

### 핵심 설정 (`script.js`)
- **APARTMENT_ID**: `'speed_apartment2'` - 이 아파트 단지의 고유 식별자
- **EmailJS 통합**: 재시도 로직을 포함한 자동 초기화
- **Supabase 연결**: 다중 방법 클라이언트 초기화
- **카카오 SDK**: 선택적 소셜 공유 통합

### Supabase 설정 (`supabase-config.js`)
- **데이터베이스 클라이언트**: 연결 테스트를 포함한 자동 초기화
- **API 자격 증명**: 클라이언트 사용을 위한 내장 anon 키
- **테이블 검증**: 필수 데이터베이스 스키마 확인
- **Edge Functions**: 향후 SMS 기능을 위한 기본 URL 설정

### UI 설정 (`style.css`)
- **색상 스키마**: 녹색 그라디언트 테마 (`#4CAF50`에서 `#45a049`)
- **반응형 중단점**: 모바일 우선 디자인 원칙
- **애니메이션 시스템**: 부드러운 전환과 미세 상호작용
- **모달 시스템**: 관리 기능용 오버레이 모달

## 🔧 개발 가이드라인

### 폼 작업하기
- 클라이언트 측 검증을 위해 HTML5 검증 속성 사용
- Supabase RLS 정책을 통한 서버 측 검증 구현
- 순수 JavaScript로 폼 상태 처리 (프레임워크 없음)
- 모든 상호작용에 대해 명확한 사용자 피드백 제공

### 데이터베이스 통합
- 데이터베이스 작업 전에 항상 Supabase 연결 확인
- 모든 비동기 데이터베이스 호출에 try-catch 블록 사용
- 적절한 오류 처리 및 사용자 알림 구현
- 디버깅을 위해 모든 데이터베이스 작업 로깅

### 모바일 개발
- 실제 모바일 기기에서 모든 기능 테스트
- Eruda를 사용한 모바일 디버깅을 위해 `?debug=true` 사용
- 터치 친화적 상호작용 구현 (최소 44px 터치 대상)
- 네트워크 제한 및 오프라인 시나리오 고려

### 새 기능 추가
- 기존 순수 JavaScript 패턴 따르기
- 모바일 우선 반응형 디자인 접근법 유지
- 적절한 오류 처리 및 로깅 추가
- 필요시 데이터베이스 스키마 문서 업데이트

### 보안 고려사항
- API 키가 클라이언트 측에서 보임 (anon 키만 사용)
- Supabase에서 행 수준 보안(RLS) 구현
- 클라이언트 및 서버 측 모두에서 사용자 입력 검증
- localStorage나 클라이언트 측에 민감한 데이터 저장 금지

## 📊 데이터 지속성

### 로컬 스토리지 사용
- 관리자 이메일/전화번호 설정
- 사용자 편의를 위한 폼 자동 저장
- UI 환경설정 및 설정

### Supabase 데이터베이스
- **신청서**: 전체 데이터가 포함된 모든 폼 제출
- **관리자 설정**: 아파트별 설정
- **알림 로그**: 모든 커뮤니케이션에 대한 감사 추적

### 파일 관리
- **QR 코드**: 클라이언트 측에서 생성, PNG/JPG로 다운로드 가능
- **CSS/JS**: 단일 파일, 번들링 불필요
- **이미지**: 내장 또는 CDN 연결 에셋만 사용

## ⚡ 성능 고려사항

- **빌드 과정 없음**: 빠른 개발을 위한 직접 파일 서빙
- **CDN 의존성**: CDN에서 외부 라이브러리 로드
- **최소한의 JavaScript**: 최적 성능을 위한 순수 JS
- **점진적 로딩**: HTML 렌더링 후 스크립트 로드
- **모바일 최적화**: 3G/4G 네트워크에 최적화

## 🔍 디버깅 및 모니터링

### 모바일 디버깅
```javascript
// 모바일 디버그 콘솔 활성화
window.location.href = "?debug=true";
// 또는
window.location.hash = "eruda";
```

### 오류 로깅
- 전역 오류 핸들러가 모든 JavaScript 오류 포착
- 재시도 시도와 함께 네트워크 오류 로깅
- Supabase 특정 문제 해결을 포함한 데이터베이스 오류
- 한국어로 된 사용자 친화적 오류 메시지

### 연결 테스트
```javascript
// Supabase 연결 테스트
testSupabaseConnection();

// EmailJS 초기화 테스트
initializeEmailJS();
```

## 📱 모바일 특정 기능

### 사용자 경험
- **줌 방지 입력**: 모바일 키보드 줌 방지
- **터치 최적화**: 큰 버튼과 터치 영역
- **네트워크 인식**: 느리거나 불안정한 연결 처리
- **배터리 효율성**: 최소한의 JavaScript 실행

### 개발 도구
- **Eruda 콘솔**: 모바일에서 완전한 개발자 도구
- **오류 복사**: 모바일에서 직접 오류 로그 복사
- **네트워크 모니터링**: API 호출 성능 추적
- **터치 디버깅**: 터치 이벤트에 대한 시각적 피드백

이 애플리케이션은 아파트 관리팀이 거주자들로부터 통신 환경 개선 요청을 수집하고 관리할 수 있도록 설계되었으며, 모바일 사용성과 관리 효율성에 중점을 두고 있습니다.

## 중요 지시사항

사용자가 클로드 코드 CLI를 종료한다는 어투의 문장이나 단어를 사용하면, 자동으로 사용자가 지시하고 작업했던 디렉토리의 상위 디렉토리에 지금까지의 작업 내용과 앞으로의 내용을 지시하는 [인수인계.md]를 생성해야 합니다.