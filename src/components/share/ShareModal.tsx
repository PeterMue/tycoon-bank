import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  Upload,
  QrCode,
} from 'lucide-react';
import { GameState } from '../../types/game';
import { useTranslation } from '../../i18n/useTranslation';
import { createShareableUrl } from '../../utils/urlState';

interface ShareModalProps {
  isOpen: boolean;
  gameState: GameState;
  onClose: () => void;
  onImportState: (state: GameState) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  gameState,
  onClose,
  onImportState,
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const shareableUrl = createShareableUrl(gameState);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      const textArea = document.createElement('textarea');
      textArea.value = shareableUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleExportJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(gameState, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `tycoonbank_save_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.players) && parsed.config) {
          onImportState(parsed);
          setImportStatus(t.share.importSuccess);
          setTimeout(() => {
            setImportStatus(null);
            onClose();
          }, 1500);
        } else {
          setImportStatus(t.share.importError);
        }
      } catch {
        setImportStatus(t.share.importError);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Share2 className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {t.share.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            {t.share.description}
          </p>

          {/* Copy Link Input Bar */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
              {t.share.shareVia}
            </label>
            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-700">
              <input
                type="text"
                readOnly
                value={shareableUrl}
                className="w-full bg-transparent text-xs text-slate-300 px-2 py-1 font-mono focus:outline-none truncate"
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                  copied
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t.share.linkCopied : t.share.copyLink}</span>
              </button>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center text-center">
            <span className="text-[11px] font-semibold text-slate-400 mb-3 flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-purple-400" />
              <span>{t.share.scanQr}</span>
            </span>
            <div className="bg-white p-3 rounded-2xl shadow-lg shadow-white/5">
              <QRCodeSVG
                value={shareableUrl}
                size={160}
                level="M"
                includeMargin={false}
              />
            </div>
          </div>

          {/* Backup / Export / Import JSON */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleExportJSON}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.share.exportJson}</span>
            </button>

            <label className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>{t.share.importJson}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>

          {importStatus && (
            <div className="p-2.5 rounded-xl bg-purple-950/50 border border-purple-500/30 text-purple-300 text-xs text-center font-semibold">
              {importStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
