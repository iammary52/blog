-- Posts 테이블
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  content text not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- profiles 테이블
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS 활성화
alter table public.posts enable row level security;
alter table public.profiles enable row level security;

-- Posts 정책
create policy "누구나 게시글 조회 가능" on public.posts
  for select using (true);

create policy "인증된 사용자만 게시글 작성 가능" on public.posts
  for insert with check (auth.uid() = user_id);

create policy "작성자만 게시글 수정 가능" on public.posts
  for update using (auth.uid() = user_id);

create policy "작성자만 게시글 삭제 가능" on public.posts
  for delete using (auth.uid() = user_id);

-- Profiles 정책
create policy "누구나 프로필 조회 가능" on public.profiles
  for select using (true);

create policy "본인만 프로필 수정 가능" on public.profiles
  for insert with check (auth.uid() = id);

create policy "본인만 프로필 업데이트 가능" on public.profiles
  for update using (auth.uid() = id);

-- 회원가입 시 자동으로 profile 생성하는 트리거
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- investment_transactions 테이블 (투자거래 관리)
create table if not exists public.investment_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,

  -- 기본 정보
  contract_number text,
  transaction_date date not null,
  registration_change_date date,
  fund_source text,
  company_name text not null,

  -- 투자 유형
  investment_type text not null,           -- 우선주, 보통주 등
  share_type text,                          -- 신주, 구주

  -- 거래 구분
  transaction_category text not null,      -- 투자, 회수, 감액 등
  discount_category text,                   -- 강액/대손 세부 구분

  -- 금액
  principal_krw numeric,
  profit_loss_krw numeric,
  currency text default '대한민국 원',
  principal_foreign numeric,
  profit_loss_foreign numeric,

  -- 주식수
  investment_common_shares bigint,         -- 투자 보통주식수
  investment_preferred_shares bigint,      -- 투자 우선주식수
  issued_common_shares bigint,             -- 출발행 보통주식수
  issued_preferred_shares bigint,          -- 출발행 우선주식수
  face_value numeric,                       -- 액면가

  -- 감액(환입) 관련
  discounted_common_shares bigint,         -- 감액된 보통주식수
  discounted_preferred_shares bigint,      -- 감액된 우선주식수
  discount_reason text,                     -- 감액(환입)사유
  discount_amount_krw numeric,             -- 감액금액(원화)

  -- 기업가치
  enterprise_value numeric,                -- 기업가치

  -- 매도/매수자 정보
  counterparty_type text,
  counterparty_name text,
  counterparty_business_number text,
  acquisition_method text,
  acquisition_timing text,

  -- 기타
  action_items text,                        -- 조치사항
  notes text,                               -- 비고

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.investment_transactions enable row level security;

create policy "누구나 투자거래 조회 가능" on public.investment_transactions
  for select using (true);

create policy "인증된 사용자만 투자거래 작성 가능" on public.investment_transactions
  for insert with check (auth.uid() = user_id);

create policy "작성자만 투자거래 수정 가능" on public.investment_transactions
  for update using (auth.uid() = user_id);

create policy "작성자만 투자거래 삭제 가능" on public.investment_transactions
  for delete using (auth.uid() = user_id);

-- Storage 버킷 생성 (Supabase 대시보드에서 직접 생성하거나 아래 SQL 실행)
-- insert into storage.buckets (id, name, public) values ('post-images', 'post-images', true);

-- Storage 정책
-- create policy "누구나 이미지 조회 가능" on storage.objects for select using (bucket_id = 'post-images');
-- create policy "인증된 사용자만 이미지 업로드 가능" on storage.objects for insert with check (bucket_id = 'post-images' and auth.role() = 'authenticated');
-- create policy "업로더만 이미지 삭제 가능" on storage.objects for delete using (bucket_id = 'post-images' and auth.uid() = owner);
