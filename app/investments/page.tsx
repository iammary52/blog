import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export const revalidate = 0

export default async function InvestmentsPage() {
  const supabase = await createClient()

  const { data: transactions, error } = await supabase
    .from('investment_transactions')
    .select('id, contract_number, transaction_date, company_name, investment_type, transaction_category, discount_category, principal_krw, discounted_common_shares, discounted_preferred_shares, discount_reason, created_at')
    .order('transaction_date', { ascending: false })

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">투자거래 관리</h1>
            <p className="text-sm text-gray-400 mt-1">투자거래 내역을 조회하고 관리합니다</p>
          </div>
          <Link
            href="/investments/new"
            className="text-sm bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition-colors"
          >
            + 거래 추가
          </Link>
        </div>

        {error && (
          <div className="text-center py-4 text-red-400 text-sm">
            오류: {error.message}
          </div>
        )}

        {!transactions || transactions.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">등록된 투자거래가 없습니다.</p>
            <p className="text-sm mt-2">
              <Link href="/investments/new" className="text-gray-900 underline">새 거래를 추가</Link>해 보세요.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs text-gray-500">
                  <th className="px-4 py-3 font-medium">계약번호</th>
                  <th className="px-4 py-3 font-medium">거래일자</th>
                  <th className="px-4 py-3 font-medium">투자기업</th>
                  <th className="px-4 py-3 font-medium">투자유형</th>
                  <th className="px-4 py-3 font-medium">거래구분</th>
                  <th className="px-4 py-3 font-medium">거래원금(원화)</th>
                  <th className="px-4 py-3 font-medium">감액주식수(보통)</th>
                  <th className="px-4 py-3 font-medium">감액주식수(우선)</th>
                  <th className="px-4 py-3 font-medium">감액사유</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-700">{tx.contract_number ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{tx.transaction_date}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{tx.company_name}</td>
                    <td className="px-4 py-3 text-gray-600">{tx.investment_type}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        tx.transaction_category === '감액'
                          ? 'bg-red-50 text-red-600'
                          : tx.transaction_category === '회수'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-green-50 text-green-600'
                      }`}>
                        {tx.transaction_category}
                        {tx.discount_category ? ` / ${tx.discount_category}` : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-right">
                      {tx.principal_krw != null ? tx.principal_krw.toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-right">
                      {tx.discounted_common_shares != null ? tx.discounted_common_shares.toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-right">
                      {tx.discounted_preferred_shares != null ? tx.discounted_preferred_shares.toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">{tx.discount_reason ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
