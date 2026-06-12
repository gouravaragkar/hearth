import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useHome } from '@/context/HomeContext';
import { useHomeData } from '@/hooks/useHomeData';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, ArrowLeft, FileUp, Trash2 } from 'lucide-react';

const CATEGORIES = [
  'Housing', 'Transport', 'Groceries', 'Utilities',
  'Healthcare', 'Entertainment', 'Dining', 'Shopping', 'Education', 'Other',
];

async function extractPdfText(file) {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(' ') + '\n';
  }
  return text;
}

function TransactionRow({ t, currency, onToggle, onCategoryChange, onRemove, showFrequency }) {
  return (
    <div className={`grid grid-cols-[auto_1fr_auto_auto] gap-3 px-4 py-3 items-start transition-colors ${!t.selected ? 'opacity-40' : ''}`}>
      <button
        onClick={() => onToggle(t.id)}
        className={`mt-0.5 h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${t.selected ? 'bg-primary border-primary' : 'border-border'}`}
      >
        {t.selected && <CheckCircle2 size={10} className="text-primary-foreground" />}
      </button>
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-medium text-foreground truncate">{t.name}</p>
        {showFrequency ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded-full capitalize">{t.frequency}</span>
            <Select value={t.category} onValueChange={(v) => onCategoryChange(t.id, v)}>
              <SelectTrigger className="h-6 text-xs rounded-lg px-2 py-0 w-32 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">{t.date}</p>
            <Select value={t.category} onValueChange={(v) => onCategoryChange(t.id, v)}>
              <SelectTrigger className="h-6 text-xs rounded-lg px-2 py-0 w-36 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </>
        )}
      </div>
      <p className="text-sm font-semibold text-foreground text-right whitespace-nowrap">
        {currency} {t.amount.toFixed(2)}
      </p>
      <button
        onClick={() => onRemove(t.id)}
        className="mt-0.5 text-muted-foreground hover:text-destructive transition-colors shrink-0"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export default function ImportPage() {
  const navigate = useNavigate();
  const { activeHome, fetchHomes } = useHome();
  const { mutateShared } = useHomeData();
  const qc = useQueryClient();
  const currency = activeHome?.currency || 'AUD';

  const [step, setStep] = useState('upload');
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [importedCounts, setImportedCounts] = useState({ expenses: 0, recurring: 0 });
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = useCallback((f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (ext !== 'pdf') {
      setError('Only PDF files are supported.');
      return;
    }
    setError('');
    setFile(f);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const processFile = async () => {
    if (!file) return;
    setStep('processing');
    setError('');

    try {
      const rawText = await extractPdfText(file);
      console.log('EXTRACTED TEXT LENGTH:', rawText.length);
      console.log('EXTRACTED TEXT PREVIEW:', rawText.slice(0, 500));
      if (!rawText.trim()) throw new Error('Could not extract text from file. Make sure it is a machine-readable PDF, not a scanned image.');

      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/categorise-transactions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ rawText, currency }),
        }
      );

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (!data.transactions?.length) throw new Error('No debit transactions found in this statement.');

      // Deduplicate recurring transactions — keep only one per unique name
      const deduplicated = data.transactions.reduce((acc, t) => {
        if (t.is_recurring) {
          const existing = acc.find(x =>
            x.is_recurring &&
            x.name.toLowerCase().trim() === t.name.toLowerCase().trim()
          );
          if (existing) {
            if (t.amount > existing.amount) {
              return acc.map(x => x === existing ? t : x);
            }
            return acc;
          }
        }
        return [...acc, t];
      }, []);

      setTransactions(deduplicated.map((t, i) => ({ ...t, id: i, selected: true })));
      setStep('review');
    } catch (e) {
      setError(e.message || 'Failed to process file. Please try again.');
      setStep('upload');
    }
  };

  const toggleRow = (id) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, selected: !t.selected } : t));
  };

  const toggleAll = () => {
    const anySelected = transactions.some(t => t.selected);
    setTransactions(prev => prev.map(t => ({ ...t, selected: !anySelected })));
  };

  const updateCategory = (id, category) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, category } : t));
  };

  const removeRow = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleImport = async () => {
    const selected = transactions.filter(t => t.selected);
    if (!selected.length) return;
    setImporting(true);

    // Auto-create a home if the user has none yet
    let homeId = activeHome?.id;
    let homeCurrency = currency;
    if (!homeId) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const TIMEZONE_CURRENCY_MAP = {
          'Australia/Sydney': 'AUD', 'Australia/Melbourne': 'AUD', 'Australia/Brisbane': 'AUD',
          'Australia/Perth': 'AUD', 'Australia/Adelaide': 'AUD', 'America/New_York': 'USD',
          'America/Chicago': 'USD', 'America/Denver': 'USD', 'America/Los_Angeles': 'USD',
          'Europe/London': 'GBP', 'Europe/Paris': 'EUR', 'Europe/Berlin': 'EUR',
          'Asia/Kolkata': 'INR', 'Asia/Tokyo': 'JPY', 'Asia/Shanghai': 'CNY',
          'Asia/Singapore': 'SGD', 'Asia/Dubai': 'AED', 'America/Toronto': 'CAD',
          'America/Vancouver': 'CAD', 'Pacific/Auckland': 'NZD',
        };
        homeCurrency = TIMEZONE_CURRENCY_MAP[tz] || 'USD';
        const { data: newHome } = await supabase
          .from('homes')
          .insert({ name: 'My Home', currency: homeCurrency, emoji: '🏠', created_by: user.id, members: [] })
          .select()
          .single();
        if (newHome) {
          homeId = newHome.id;
          await fetchHomes();
        }
      } catch (e) {
        console.error('Failed to auto-create home:', e);
      }
    }

    let expenseCount = 0;
    let recurringCount = 0;

    for (const t of selected) {
      try {
        if (t.is_recurring) {
          await mutateShared('RecurringExpense', 'create', {
            name: t.name,
            amount: t.amount,
            category: t.category,
            frequency: t.frequency || 'monthly',
            start_date: t.date,
            home_id: homeId,
            currency: homeCurrency,
          });
          recurringCount++;
        } else {
          await mutateShared('Expense', 'create', {
            name: t.name,
            amount: t.amount,
            category: t.category,
            date: t.date,
            home_id: homeId,
            currency: homeCurrency,
          });
          expenseCount++;
        }
      } catch (e) {
        console.error('Failed to import:', t.name, e);
      }
    }

    qc.invalidateQueries({ queryKey: ['homeData'] });
    setImportedCounts({ expenses: expenseCount, recurring: recurringCount });
    setImporting(false);
    setStep('done');
  };

  const recurringTransactions = transactions.filter(t => t.is_recurring);
  const oneTimeTransactions = transactions.filter(t => !t.is_recurring);
  const selectedCount = transactions.filter(t => t.selected).length;
  const totalAmount = transactions.filter(t => t.selected).reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-5 animate-fade-up px-4 py-6 pb-28 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/assistant')}
          className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors shrink-0"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <div>
          <h1 className="text-base sm:text-xl font-bold text-foreground flex items-center gap-2">
            <FileUp size={18} className="text-primary shrink-0" /> Import Statement
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">PDF bank statements</p>
        </div>
      </div>

      {/* Step: Upload */}
      {step === 'upload' && (
        <div className="space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
              dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
          >
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload size={24} className="text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">Drop your bank statement here</p>
              <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
              <p className="text-xs text-muted-foreground mt-2">PDF only · Max 10MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>

          {file && (
            <div className="flex items-center gap-3 bg-muted rounded-xl px-4 py-3">
              <FileText size={18} className="text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
              <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground">
                <Trash2 size={15} />
              </button>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-xl px-4 py-3">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="bg-muted/60 rounded-xl px-4 py-3 space-y-1.5 text-xs text-muted-foreground">
            <p className="font-medium text-foreground text-sm">Tips for best results</p>
            <p>• Export a PDF statement from your bank's online portal or app</p>
            <p>• Use machine-readable PDFs — scanned/image PDFs won't work</p>
            <p>• Only debit transactions (money out) will be imported</p>
            <p>• Recurring bills and subscriptions will be detected automatically</p>
          </div>

          <Button
            onClick={processFile}
            disabled={!file}
            className="w-full bg-primary text-primary-foreground rounded-xl h-11"
          >
            Analyse Statement
          </Button>
        </div>
      )}

      {/* Step: Processing */}
      {step === 'processing' && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 size={28} className="text-primary animate-spin" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">Analysing your statement</p>
            <p className="text-sm text-muted-foreground mt-1">Claude is extracting and categorising transactions...</p>
          </div>
        </div>
      )}

      {/* Step: Review */}
      {step === 'review' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">{transactions.length} transactions found</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedCount} selected · {currency} {totalAmount.toFixed(2)}
              </p>
            </div>
            <button onClick={toggleAll} className="text-xs text-primary font-medium">
              {transactions.some(t => t.selected) ? 'Deselect all' : 'Select all'}
            </button>
          </div>

          {/* Recurring section */}
          {recurringTransactions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">🔄 Suggested Recurring</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  {recurringTransactions.filter(t => t.selected).length} selected
                </span>
              </div>
              <p className="text-xs text-muted-foreground">These look like regular bills or subscriptions</p>
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="divide-y divide-border max-h-[30vh] overflow-y-auto">
                  {recurringTransactions.map(t => (
                    <TransactionRow
                      key={t.id}
                      t={t}
                      currency={currency}
                      onToggle={toggleRow}
                      onCategoryChange={updateCategory}
                      onRemove={removeRow}
                      showFrequency={true}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* One-time section */}
          {oneTimeTransactions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">🧾 One-Time Expenses</span>
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                  {oneTimeTransactions.filter(t => t.selected).length} selected
                </span>
              </div>
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="divide-y divide-border max-h-[40vh] overflow-y-auto">
                  {oneTimeTransactions.map(t => (
                    <TransactionRow
                      key={t.id}
                      t={t}
                      currency={currency}
                      onToggle={toggleRow}
                      onCategoryChange={updateCategory}
                      onRemove={removeRow}
                      showFrequency={false}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => { setStep('upload'); setFile(null); setTransactions([]); }}
              className="flex-1 rounded-xl h-11"
            >
              Start Over
            </Button>
            <Button
              onClick={handleImport}
              disabled={selectedCount === 0 || importing}
              className="flex-1 bg-primary text-primary-foreground rounded-xl h-11 gap-2"
            >
              {importing ? (
                <><Loader2 size={16} className="animate-spin" /> Importing...</>
              ) : (
                `Import ${selectedCount} item${selectedCount !== 1 ? 's' : ''}`
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step: Done */}
      {step === 'done' && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 size={28} className="text-green-600" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground text-lg">Import complete!</p>
            <p className="text-sm text-muted-foreground mt-1">
              {importedCounts.expenses} expense{importedCounts.expenses !== 1 ? 's' : ''} + {importedCounts.recurring} recurring added
            </p>
          </div>
          <div className="flex gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() => { setStep('upload'); setFile(null); setTransactions([]); }}
              className="rounded-xl"
            >
              Import Another
            </Button>
            <Button
              onClick={() => navigate('/one-time')}
              className="bg-primary text-primary-foreground rounded-xl"
            >
              View Expenses
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
