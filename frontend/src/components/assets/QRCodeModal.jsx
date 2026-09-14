import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, QrCode, Laptop, Copy, Check } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

export const QRCodeModal = ({ isOpen, onClose, asset }) => {
  const qrRef = useRef(null);
  const [copied, setCopied] = React.useState(false);

  if (!asset) return null;

  // The QR code stores asset identification payload or details URL
  const qrValue = `${window.location.origin}/assets/${asset._id}`;

  const downloadQRCode = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `QR-${asset.assetId}-${asset.brand}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Asset Tag & QR Code`}
      subtitle={`Hardware identification label for ${asset.assetId}`}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center text-center space-y-4 py-2">
        {/* Printable Asset Tag Preview */}
        <div
          ref={qrRef}
          className="p-6 rounded-2xl bg-white border-2 border-dashed border-slate-300 dark:border-slate-700 shadow-sm flex flex-col items-center max-w-xs w-full"
        >
          <div className="flex items-center gap-2 mb-3">
            <Laptop className="w-4 h-4 text-brand-600" />
            <span className="text-xs font-bold text-slate-800 tracking-wider uppercase">
              Property of Enterprise
            </span>
          </div>

          <QRCodeCanvas
            value={qrValue}
            size={180}
            level="H"
            includeMargin={true}
            bgColor="#ffffff"
            fgColor="#0f172a"
          />

          <div className="mt-3 text-center">
            <span className="text-base font-extrabold text-slate-900 block font-mono">
              {asset.assetId}
            </span>
            <span className="text-xs text-slate-600 block font-medium truncate max-w-[200px]">
              {asset.name}
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
              S/N: {asset.serialNumber}
            </span>
          </div>
        </div>

        {/* URL copy option */}
        <div className="w-full flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
          <span className="truncate font-mono">{qrValue}</span>
          <button
            onClick={handleCopyLink}
            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0 text-brand-600 dark:text-brand-400"
            title="Copy QR URL"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            icon={Download}
            className="flex-1"
            onClick={downloadQRCode}
          >
            Download QR
          </Button>
        </div>
      </div>
    </Modal>
  );
};
