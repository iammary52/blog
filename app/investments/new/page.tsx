'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const INVESTMENT_TYPES = ['보통주', '우선주', 'CB', 'BW', '기타']
const TRANSACTION_CATEGORIES = ['투자', '회수', '감액', '환입']
const DISCOUNT_CATEGORIES = ['강액', '대손', '일부회수', '전액회수']
const SHARE_TYPES = ['신주', '구주']

export default function NewInvestmentPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 기본 정보
  const [contractNumber, setContractNumber] = useState('')
  const [transactionDate, setTransactionDate] = useState('')
  const [registrationChangeDate, setRegistrationChangeDate] = useState('')
  const [fundSource, setFundSource] = useState('')
  const [companyName, setCompanyName] = useState('')

  // 투자 유형
  const [investmentType, setInvestmentType] = useState('우선주')
  const [shareType, setShareType] = useState('신주')

  // 거래 구분
  const [transactionCategory, setTransactionCategory] = useState('회수')
  const [discountCategory, setDiscountCategory] = useState('')

  // 금액
  const [principalKrw, setPrincipalKrw] = useState('')
  const [profitLossKrw, setProfitLossKrw] = useState('')

  // 주식수
  const [investmentCommonShares, setInvestmentCommonShares] = useState('')
  const [investmentPreferredShares, setInvestmentPreferredShares] = useState('')
  const [issuedCommonShares, setIssuedCommonShares] = useState('')
  const [issuedPreferredShares, setIssuedPreferredShares] = useState('')
  const [faceValue, setFaceValue] = useState('')

  // 감액(환입) 관련 — 핵심 필드
  const [discountedCommonShares, setDiscountedCommonShares] = useState('')
  const [discountedPreferredShares, setDiscountedPreferredShares] = useState('')
  const [discountReason, setDiscountReason] = useState('')
  const [discountAmountKrw, setDiscountAmountKrw] = useState('')

  // 매도/매수자 정보
  const [counterpartyType, setCounterpartyType] = useState('')
  const [counterpartyName, setCounterpartyName] = useState('')
  const [counterpartyBusinessNumber, setCounterpartyBusinessNumber] = useState('')

  // 기타
  const [actionItems, setActionItems] = useState('')
  const [notes, setNotes] = useState('')

  const isDiscountTransaction = transactionCategory === '감액' || transactionCategory === '환입' ||
    (transactionCategory === '회수' && discountCategory !== '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyName.trim() || !transactionDate || !transactionCategory) {
      setError('필수 항목을 입력해주세요.')
      return
    }
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('로그인이 필요합니다.')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('investment_transactions').insert({
      user_id: user.id,
      contract_number: contractNumber || null,
      transaction_date: transactionDate,
      registration_change_date: registrationChangeDate || null,
      fund_source: fundSource || null,
      company_name: companyName,
      investment_type: investmentType,
      share_type: shareType || null,
      transaction_category: transactionCategory,
      discount_category: discountCategory || null,
      principal_krw: principalKrw ? Number(principalKrw.replace(/,/g, '')) : null,
      profit_loss_krw: profitLossKrw ? Number(profitLossKrw.replace(/,/g, '')) : null,
      investment_common_shares: investmentCommonShares ? Number(investmentCommonShares.replace(/,/g, '')) : null,
      investment_preferred_shares: investmentPreferredShares ? Number(investmentPreferredShares.replace(/,/g, '')) : null,
      issued_common_shares: issuedCommonShares ? Number(issuedCommonShares.replace(/,/g, '')) : null,
      issued_preferred_shares: issuedPreferredShares ? Number(issuedPreferredShares.replace(/,/g, '')) : null,
      face_value: faceValue ? Number(faceValue) : null,
      discounted_common_shares: discountedCommonShares ? Number(discountedCommonShares.replace(/,/g, '')) : null,
      discounted_preferred_shares: discountedPreferredShares ? Number(discountedPreferredShares.replace(/,/g, '')) : null,
      discount_reason: discountReason || null,
      discount_amount_krw: discountAmountKrw ? Number(discountAmountKrw.replace(/,/g, '')) : null,
      counterparty_type: counterpartyType || null,
      counterparty_name: counterpartyName || null,
      counterparty_business_number: counterpartyBusinessNumber || null,
      action_items: actionItems || null,
      notes: notes || null,
    })

    if (insertError) {
      setError(`저장 실패: ${insertError.message}`)
      setLoading(false)
      return
    }

    router.push('/investments')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <nav className="border-b border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/investments" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">← 목록</Link>
            <span className="text-gray-200">|</span>
            <span className="text-base font-semibold text-gray-900">투자거래 등록</span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading || !companyName.trim() || !transactionDate}
            className="text-sm bg-gray-900 text-white px-4 py-1.5 rounded-full hover:bg-gray-700 transition-colors disabled:opacity-40"
          >
            {loading ? '저장 중...' : '저장'}
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {error && (
          <div className="mb-6 text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 기본 정보 */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3">기본 정보</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="계약번호">
                <input
                  type="text"
                  value={contractNumber}
                  onChange={e => setContractNumber(e.target.value)}
                  placeholder="I000000000"
                  className={inputCls}
                />
              </Field>
              <Field label="거래일자 *">
                <input
                  type="date"
                  value={transactionDate}
                  onChange={e => setTransactionDate(e.target.value)}
                  required
                  className={inputCls}
                />
              </Field>
              <Field label="등기변경일자">
                <input
                  type="date"
                  value={registrationChangeDate}
                  onChange={e => setRegistrationChangeDate(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="재원">
                <input
                  type="text"
                  value={fundSource}
                  onChange={e => setFundSource(e.target.value)}
                  placeholder="재원명 입력"
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="투자기업 *">
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="기업명 입력"
                required
                className={inputCls}
              />
            </Field>
          </section>

          {/* 투자 유형 / 거래 구분 */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3">투자 유형 / 거래 구분</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="투자유형 *">
                <select value={investmentType} onChange={e => setInvestmentType(e.target.value)} className={inputCls}>
                  {INVESTMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="신주(권)/구주(권)">
                <select value={shareType} onChange={e => setShareType(e.target.value)} className={inputCls}>
                  {SHARE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="거래구분 *">
                <select value={transactionCategory} onChange={e => setTransactionCategory(e.target.value)} className={inputCls}>
                  {TRANSACTION_CATEGORIES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="강액/대손">
                <select value={discountCategory} onChange={e => setDiscountCategory(e.target.value)} className={inputCls}>
                  <option value="">선택 안 함</option>
                  {DISCOUNT_CATEGORIES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </div>
          </section>

          {/* 거래 금액 */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3">거래 금액</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="거래원금(원화)">
                <input
                  type="text"
                  inputMode="numeric"
                  value={principalKrw}
                  onChange={e => setPrincipalKrw(e.target.value)}
                  placeholder="0"
                  className={`${inputCls} text-right`}
                />
              </Field>
              <Field label="거래손익(원화)">
                <input
                  type="text"
                  inputMode="numeric"
                  value={profitLossKrw}
                  onChange={e => setProfitLossKrw(e.target.value)}
                  placeholder="0"
                  className={`${inputCls} text-right`}
                />
              </Field>
            </div>
          </section>

          {/* 주식수 */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3">주식수</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div className="space-y-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">투자주식수</p>
                <Field label="보통주">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={investmentCommonShares}
                    onChange={e => setInvestmentCommonShares(e.target.value)}
                    placeholder="0"
                    className={`${inputCls} text-right`}
                  />
                </Field>
                <Field label="우선주">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={investmentPreferredShares}
                    onChange={e => setInvestmentPreferredShares(e.target.value)}
                    placeholder="0"
                    className={`${inputCls} text-right`}
                  />
                </Field>
              </div>
              <div className="space-y-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">출발행주식수</p>
                <Field label="보통주">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={issuedCommonShares}
                    onChange={e => setIssuedCommonShares(e.target.value)}
                    placeholder="0"
                    className={`${inputCls} text-right`}
                  />
                </Field>
                <Field label="우선주">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={issuedPreferredShares}
                    onChange={e => setIssuedPreferredShares(e.target.value)}
                    placeholder="0"
                    className={`${inputCls} text-right`}
                  />
                </Field>
              </div>
            </div>
            <Field label="액면가">
              <input
                type="number"
                value={faceValue}
                onChange={e => setFaceValue(e.target.value)}
                placeholder="100"
                className={`${inputCls} text-right`}
              />
            </Field>
          </section>

          {/* 감액(환입) 정보 — 핵심 섹션 */}
          <section className={`rounded-2xl border p-6 space-y-5 ${isDiscountTransaction ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}>
            <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3">
              감액(환입) 정보
              {isDiscountTransaction && (
                <span className="ml-2 text-xs font-normal text-red-500">감액/대손 거래에 해당하는 주식수와 금액을 입력하세요</span>
              )}
            </h2>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <Field label="감액된 보통주식수">
                <input
                  type="text"
                  inputMode="numeric"
                  value={discountedCommonShares}
                  onChange={e => setDiscountedCommonShares(e.target.value)}
                  placeholder="0"
                  className={`${inputCls} text-right ${isDiscountTransaction ? 'border-red-200 focus:ring-red-300' : ''}`}
                />
              </Field>
              <Field label="감액된 우선주식수">
                <input
                  type="text"
                  inputMode="numeric"
                  value={discountedPreferredShares}
                  onChange={e => setDiscountedPreferredShares(e.target.value)}
                  placeholder="0"
                  className={`${inputCls} text-right ${isDiscountTransaction ? 'border-red-200 focus:ring-red-300' : ''}`}
                />
              </Field>
            </div>

            <Field label="감액금액(원화)">
              <input
                type="text"
                inputMode="numeric"
                value={discountAmountKrw}
                onChange={e => setDiscountAmountKrw(e.target.value)}
                placeholder="0"
                className={`${inputCls} text-right ${isDiscountTransaction ? 'border-red-200 focus:ring-red-300' : ''}`}
              />
            </Field>

            <Field label="감액(환입)사유">
              <textarea
                value={discountReason}
                onChange={e => setDiscountReason(e.target.value)}
                placeholder="예: 폐업 및 법인 파산 완료"
                rows={2}
                className={`${inputCls} resize-none`}
              />
            </Field>
          </section>

          {/* 매도/매수자 정보 */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3">매도/매수자 정보</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="매도/매수자유형">
                <input
                  type="text"
                  value={counterpartyType}
                  onChange={e => setCounterpartyType(e.target.value)}
                  placeholder="유형 입력"
                  className={inputCls}
                />
              </Field>
              <Field label="매도/매수자명">
                <input
                  type="text"
                  value={counterpartyName}
                  onChange={e => setCounterpartyName(e.target.value)}
                  placeholder="이름 입력"
                  className={inputCls}
                />
              </Field>
              <Field label="사업자번호">
                <input
                  type="text"
                  value={counterpartyBusinessNumber}
                  onChange={e => setCounterpartyBusinessNumber(e.target.value)}
                  placeholder="000-00-00000"
                  className={inputCls}
                />
              </Field>
            </div>
          </section>

          {/* 조치사항 / 비고 */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3">조치사항 / 비고</h2>
            <Field label="조치사항">
              <textarea
                value={actionItems}
                onChange={e => setActionItems(e.target.value)}
                placeholder="조치사항을 입력하세요"
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </Field>
            <Field label="비고">
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="기타 참고사항"
                rows={2}
                className={`${inputCls} resize-none`}
              />
            </Field>
          </section>
        </form>
      </main>
    </div>
  )
}

const inputCls = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-shadow'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-500">{label}</label>
      {children}
    </div>
  )
}
