// Supabase 클라이언트 설정
let supabase = null;

// Supabase 클라이언트 초기화 함수
function initializeSupabase() {
    try {
        console.log('🔧 Supabase 초기화 시도...');
        
        // 다양한 방법으로 Supabase 접근 시도
        let createClient = null;
        
        // 방법 1: window.supabase
        if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
            createClient = window.supabase.createClient;
            console.log('✅ window.supabase로 접근 성공');
        }
        // 방법 2: 직접적으로 supabase 전역변수
        else if (typeof supabase !== 'undefined' && supabase.createClient) {
            createClient = supabase.createClient;
            console.log('✅ 전역 supabase로 접근 성공');
        }
        // 방법 3: CDN에서 로드된 createClient 함수 직접 사용
        else if (typeof createClient !== 'undefined') {
            console.log('✅ createClient 함수 직접 접근 성공');
        }
        // 방법 4: 브라우저에 모듈이 로드되었는지 확인
        else if (typeof window.createClient !== 'undefined') {
            createClient = window.createClient;
            console.log('✅ window.createClient로 접근 성공');
        }
        else {
            console.warn('⚠️ Supabase CDN이 아직 로드되지 않았습니다. 재시도합니다...');
            // 0.5초 후 재시도
            setTimeout(() => {
                initializeSupabase();
            }, 500);
            return null;
        }
        
        if (createClient) {
            const supabaseUrl = 'https://boorsqnfkwglzvnhtwcx.supabase.co';
            const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvb3JzcW5ma3dnbHp2bmh0d2N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NDE3NDEsImV4cCI6MjA3MjExNzc0MX0.eU0BSY8u1b-qcx3OTgvGIW-EQHotI4SwNuWAg0eqed0';
            
            console.log('🔑 Supabase URL:', supabaseUrl);
            console.log('🔑 API Key 길이:', supabaseAnonKey.length);
            
            // Supabase 클라이언트 생성
            supabase = createClient(supabaseUrl, supabaseAnonKey);
            
            console.log('✅ Supabase 클라이언트 초기화 성공:', supabase);
            
            // 연결 테스트
            testSupabaseConnection();
            
            return supabase;
        } else {
            console.error('❌ Supabase createClient 함수를 찾을 수 없습니다.');
            return null;
        }
    } catch (error) {
        console.error('💥 Supabase 클라이언트 초기화 실패:', error);
        return null;
    }
}

// Supabase 연결 테스트
async function testSupabaseConnection() {
    try {
        console.log('🧪 Supabase 연결 테스트 시작...');
        
        if (!supabase) {
            console.error('❌ supabase 클라이언트가 없습니다.');
            return;
        }
        
        // 간단한 테이블 조회로 연결 테스트
        const { data, error } = await supabase
            .from('admin_settings')
            .select('count')
            .limit(1);
            
        if (error) {
            console.error('❌ Supabase 연결 테스트 실패:', error.message);
            if (error.message.includes('JWT')) {
                console.error('🔑 API 키 문제일 수 있습니다.');
            }
            if (error.message.includes('relation') || error.message.includes('does not exist')) {
                console.error('📋 admin_settings 테이블이 존재하지 않습니다.');
            }
        } else {
            console.log('✅ Supabase 연결 테스트 성공!', data);
        }
    } catch (error) {
        console.error('💥 연결 테스트 중 오류:', error);
    }
}

// 페이지 로드 후 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSupabase);
} else {
    initializeSupabase();
}

// 데이터베이스 테이블 구조
/*
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
*/

// Supabase Edge Functions 기본 URL (프로젝트 ref 기반)
const functionsBaseUrl = `https://boorsqnfkwglzvnhtwcx.functions.supabase.co`;

// 전역 변수로 노출
window.supabaseClient = supabase;
window.initializeSupabase = initializeSupabase;
window.functionsBaseUrl = functionsBaseUrl;