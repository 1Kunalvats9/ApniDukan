'use client';

import React from 'react';
import { useAppContext } from "../../../context/AppContext";
import { Download, TrendingUp, BookOpen, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AccountingPage = () => {
    const { accounting, loading } = useAppContext();

    const exportPDF = () => {
        if (!accounting) return;

        const doc = new jsPDF();
        const today = new Date().toLocaleDateString();
        const { profitAndLoss, balanceSheet } = accounting;

        // --- Profit & Loss Page ---
        doc.setFontSize(18);
        doc.text('Profit & Loss Statement', 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`As of ${today}`, 14, 28);

        const pnlData = [
            ['Revenue', `₹${profitAndLoss.totalRevenue.toFixed(2)}`],
            ['Cost of Goods Sold (COGS)', `(₹${profitAndLoss.costOfGoodsSold.toFixed(2)})`],
            [{ content: 'Gross Profit', styles: { fontStyle: 'bold' } }, { content: `₹${profitAndLoss.grossProfit.toFixed(2)}`, styles: { fontStyle: 'bold' } }],
            ['Operating Expenses', `(₹${profitAndLoss.totalOperatingExpenses.toFixed(2)})`],
            [{ content: 'Net Profit', styles: { fontStyle: 'bold', textColor: [0, 128, 0] } }, { content: `₹${profitAndLoss.netProfit.toFixed(2)}`, styles: { fontStyle: 'bold', textColor: [0, 128, 0] } }],
        ];

        autoTable(doc, {
            startY: 35,
            head: [['Description', 'Amount']],
            body: pnlData,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185] },
            styles: { halign: 'right' },
            columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } },
        });

        // --- Balance Sheet Page ---
        doc.addPage();
        doc.setFontSize(18);
        doc.text('Balance Sheet', 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`As of ${today}`, 14, 28);

        const assetsData = [
            ['Cash', `₹${balanceSheet.assets.cash.toFixed(2)}`],
            ['Inventory', `₹${balanceSheet.assets.inventory.toFixed(2)}`],
            [{ content: 'Total Assets', styles: { fontStyle: 'bold' } }, { content: `₹${balanceSheet.assets.total.toFixed(2)}`, styles: { fontStyle: 'bold' } }],
        ];

        const liabilitiesEquityData = [
            ['Liabilities', `₹${balanceSheet.liabilities.total.toFixed(2)}`],
            ['Equity (Retained Earnings)', `₹${balanceSheet.equity.total.toFixed(2)}`],
            [{ content: 'Total Liabilities & Equity', styles: { fontStyle: 'bold' } }, { content: `₹${(balanceSheet.liabilities.total + balanceSheet.equity.total).toFixed(2)}`, styles: { fontStyle: 'bold' } }],
        ];

        autoTable(doc, {
            startY: 35,
            head: [['Assets', 'Amount']],
            body: assetsData,
            theme: 'striped',
            headStyles: { fillColor: [39, 174, 96] },
            styles: { halign: 'right' },
            columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } },
        });

        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 10,
            head: [['Liabilities & Equity', 'Amount']],
            body: liabilitiesEquityData,
            theme: 'striped',
            headStyles: { fillColor: [231, 76, 60] },
            styles: { halign: 'right' },
            columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } },
        });

        doc.save(`Accounting_Reports_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    if (loading) return <div className="p-6 text-center">Loading accounting data...</div>;
    if (!accounting) return <div className="p-6 text-center">Could not load accounting data.</div>

    const { profitAndLoss, balanceSheet } = accounting;

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Accounting Reports</h1>
                    <p className="text-sm text-slate-500">A financial overview of your business.</p>
                </div>
                <button onClick={exportPDF} className="btn btn-primary w-full md:w-auto">
                    <Download size={16} className="mr-2" />
                    Export as PDF
                </button>
            </div>
            <div className="alert-info">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">These reports are calculated based on your sales, inventory costs, and manually entered expenses/liabilities. For official use, please consult with a professional accountant.</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h2 className="card-header flex items-center"><TrendingUp size={18} className="mr-2" />Profit & Loss Statement</h2>
                    <div className="p-4 space-y-3">
                        <div className="flex justify-between"><span>Revenue (Total Sales)</span> <span>₹{profitAndLoss.totalRevenue.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Cost of Goods Sold (COGS)</span> <span>(₹{profitAndLoss.costOfGoodsSold.toFixed(2)})</span></div>
                        <hr/>
                        <div className="flex justify-between font-bold"><span>Gross Profit</span> <span>₹{profitAndLoss.grossProfit.toFixed(2)}</span></div>
                        <hr/>
                        <div className="flex justify-between"><span>Operating Expenses</span> <span>(₹{profitAndLoss.totalOperatingExpenses.toFixed(2)})</span></div>
                        <hr/>
                        <div className="flex justify-between font-bold text-lg text-green-600"><span>Net Profit / (Loss)</span> <span>₹{profitAndLoss.netProfit.toFixed(2)}</span></div>
                    </div>
                </div>
                <div className="card">
                    <h2 className="card-header flex items-center"><BookOpen size={18} className="mr-2" />Balance Sheet</h2>
                    <div className="p-4 space-y-4">
                        <div>
                            <h3 className="font-bold mb-2 text-slate-800">Assets</h3>
                            <div className="flex justify-between text-sm"><span>Cash (Approximated)</span> <span>₹{balanceSheet.assets.cash.toFixed(2)}</span></div>
                            <div className="flex justify-between text-sm"><span>Inventory (at Cost)</span> <span>₹{balanceSheet.assets.inventory.toFixed(2)}</span></div>
                            <hr/>
                            <div className="flex justify-between font-bold"><span>Total Assets</span> <span>₹{balanceSheet.assets.total.toFixed(2)}</span></div>
                        </div>
                        <div>
                            <h3 className="font-bold mb-2 text-slate-800">Liabilities & Equity</h3>
                            <div className="flex justify-between text-sm"><span>Liabilities (Loans, Debts)</span> <span>₹{balanceSheet.liabilities.total.toFixed(2)}</span></div>
                            {/* FIX: Replaced ' with &apos; to escape the apostrophe */}
                            <div className="flex justify-between text-sm"><span>Owner&apos;s Equity</span> <span>₹{balanceSheet.equity.total.toFixed(2)}</span></div>
                            <hr/>
                            <div className="flex justify-between font-bold"><span>Total Liabilities & Equity</span> <span>₹{(balanceSheet.liabilities.total + balanceSheet.equity.total).toFixed(2)}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountingPage;