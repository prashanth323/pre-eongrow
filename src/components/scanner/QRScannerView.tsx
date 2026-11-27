import React, { useState, useRef, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Camera,
  CameraOff,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { ABSTRACT_IMAGES } from '../../lib/abstractImages';
import { DataService } from '../../services/dataService';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface ScanHistoryItem {
  id: string;
  token: string;
  result: 'success' | 'already_used' | 'invalid';
  ticketNumber?: string;
  attendeeName?: string;
  eventTitle?: string;
  scannedAt: string;
}

export const QRScannerView: React.FC = () => {
  const { profile } = useAuth();
  const [tokenInput, setTokenInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [lastScanResult, setLastScanResult] = useState<{
    status: 'idle' | 'success' | 'already_used' | 'invalid';
    message: string;
    ticketNumber?: string;
    attendeeName?: string;
    eventTitle?: string;
  }>({ status: 'idle', message: '' });

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera hardware access is not supported by your browser or environment.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access note:', err);
      setCameraError(err.message || 'Unable to access camera');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([
    {
      id: 'scan-1',
      token: 'ngf_qr_9e4c19a07b4f2c918e77a2d10c558b3e94fa10b9c2847a',
      result: 'success',
      ticketNumber: 'TKT-NGTS-8842',
      attendeeName: 'Aarav Sharma',
      eventTitle: 'eongrow India Tech & Startup Summit 2026',
      scannedAt: 'Just now',
    },
  ]);

  const handleValidate = async (qrTokenToScan?: string) => {
    const token = qrTokenToScan || tokenInput.trim();
    if (!token) return;

    setIsValidating(true);
    const result = await DataService.validateTicketToken(token);
    setIsValidating(false);

    if (result.isValid) {
      setLastScanResult({
        status: 'success',
        message: 'TICKET VALID — ADMIT ATTENDEE',
        ticketNumber: result.ticketNumber,
        attendeeName: result.attendeeName,
        eventTitle: result.eventTitle,
      });

      setScanHistory((prev) => [
        {
          id: `scan-${Date.now()}`,
          token,
          result: 'success',
          ticketNumber: result.ticketNumber,
          attendeeName: result.attendeeName,
          eventTitle: result.eventTitle,
          scannedAt: 'Just now',
        },
        ...prev,
      ]);
    } else if (result.scanResult === 'already_used') {
      setLastScanResult({
        status: 'already_used',
        message: 'ALREADY SCANNED — DUPLICATE CHECK-IN DETECTED',
        ticketNumber: result.ticketNumber,
        attendeeName: result.attendeeName,
        eventTitle: result.eventTitle,
      });

      setScanHistory((prev) => [
        {
          id: `scan-${Date.now()}`,
          token,
          result: 'already_used',
          ticketNumber: result.ticketNumber,
          attendeeName: result.attendeeName,
          eventTitle: result.eventTitle,
          scannedAt: 'Just now',
        },
        ...prev,
      ]);
    } else {
      setLastScanResult({
        status: 'invalid',
        message: 'INVALID TICKET — TOKEN NOT FOUND OR CANCELLED',
      });

      setScanHistory((prev) => [
        {
          id: `scan-${Date.now()}`,
          token,
          result: 'invalid',
          scannedAt: 'Just now',
        },
        ...prev,
      ]);
    }

    setTokenInput('');
  };

  const sampleTokens = [
    { label: 'Sample Ticket 1 (Summit Pass)', token: 'ngf_qr_9e4c19a07b4f2c918e77a2d10c558b3e94fa10b9c2847a' },
    { label: 'Sample Ticket 2 (Hackathon Entry)', token: 'ngf_qr_7b21a8cd90ef34510ba4823c19e5d774aa01f568b23c91' },
    { label: 'Fake / Malformed Token', token: 'fake_unauthorized_token_xyz999' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <p className="text-xs text-[#818A84]">Staff entry utility · {profile?.fullName || 'Vikramaditya Verma'}</p>
        <h2 className="text-2xl font-extralight text-[#171C19] mt-1 tracking-tight">Event Entry QR Scanner</h2>
        <p className="text-sm text-[#818A84]">
          Real-time server-side ticket validation powered by PostgreSQL concurrency locking to prevent duplicate entries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Camera / Token Scanner */}
        <div className="md:col-span-7 space-y-5">
          <div className="apple-card text-center p-6 sm:p-7 space-y-4 border border-black/[0.06]">
            {/* Camera Viewfinder */}
            <div className="relative aspect-video bg-[#171C19] rounded-[24px] overflow-hidden flex flex-col items-center justify-center text-white border border-white/10 shadow-inner">
              {isCameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                  <img
                    src={ABSTRACT_IMAGES.security}
                    alt="Scanner Ambient"
                    className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
                  />
                  <div className="relative z-10 flex flex-col items-center">
                    <Camera className="w-10 h-10 text-white/80 mb-2" />
                    <p className="text-xs font-semibold text-white/90">Live Camera Hardware Viewfinder</p>
                    <p className="text-[10px] text-white/60 mt-1 font-mono">Activate camera or enter token below</p>
                  </div>
                </div>
              )}
              <div className="absolute inset-8 border border-white/30 rounded-2xl pointer-events-none" />
            </div>

            {cameraError && (
              <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-xl text-center">
                {cameraError}
              </p>
            )}

            <div className="flex items-center justify-center gap-2">
              <Button
                variant={isCameraActive ? 'outline' : 'secondary'}
                size="sm"
                onClick={isCameraActive ? stopCamera : startCamera}
                className="apple-press"
              >
                {isCameraActive ? (
                  <>
                    <CameraOff className="w-3.5 h-3.5 mr-1.5" /> Stop Camera
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5 mr-1.5" /> Start Live Camera
                  </>
                )}
              </Button>
            </div>

            {/* Quick Token Test Simulation */}
            <div className="space-y-2 text-left pt-2">
              <label className="text-xs font-medium text-[#818A84] block">
                Input or simulate QR code scan
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Paste or scan 64-char QR token..."
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/[0.03] border border-black/[0.08] rounded-full text-xs font-mono text-[#171C19] focus:bg-white focus:border-black/30 focus:ring-4 focus:ring-black/5 focus:outline-none transition-all"
                />
                <Button
                  variant="primary"
                  size="md"
                  isLoading={isValidating}
                  onClick={() => handleValidate()}
                  className="apple-press"
                >
                  Validate
                </Button>
              </div>

              {/* Sample QR token shortcuts for instant testing */}
              <div className="pt-2">
                <span className="text-xs text-[#818A84] block mb-1.5">Quick test tokens:</span>
                <div className="flex flex-wrap gap-1.5">
                  {sampleTokens.map((st, i) => (
                    <button
                      key={i}
                      onClick={() => handleValidate(st.token)}
                      className="px-3 py-1 rounded-full bg-black/[0.03] hover:bg-black/[0.06] text-[11px] font-medium text-[#171C19] border border-black/[0.04] cursor-pointer apple-press transition-colors"
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Validation Result Box */}
          {lastScanResult.status !== 'idle' && (
            <Card
              className={`p-6 border-2 transition-all ${
                lastScanResult.status === 'success'
                  ? 'border-black bg-black/[0.04]'
                  : lastScanResult.status === 'already_used'
                  ? 'border-amber-500 bg-amber-50/80'
                  : 'border-red-500 bg-red-50/80'
              }`}
            >
              <div className="flex items-start gap-4">
                {lastScanResult.status === 'success' ? (
                  <CheckCircle2 className="w-8 h-8 text-black flex-shrink-0" />
                ) : lastScanResult.status === 'already_used' ? (
                  <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                )}

                <div className="space-y-1">
                  <h4 className="font-light text-base tracking-wide text-[#171C19]">
                    {lastScanResult.message}
                  </h4>
                  {lastScanResult.attendeeName && (
                    <p className="text-sm font-semibold text-[#171C19]">
                      Attendee: <strong>{lastScanResult.attendeeName}</strong>
                    </p>
                  )}
                  {lastScanResult.eventTitle && (
                    <p className="text-xs text-[#818A84]">
                      Event: {lastScanResult.eventTitle} ({lastScanResult.ticketNumber})
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Scan History Audit Log */}
        <div className="md:col-span-5 space-y-4">
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8ECE9]">
              <h4 className="font-light text-sm text-[#171C19]">
                Recent Gate Scans
              </h4>
              <span className="text-xs text-[#818A84]">{scanHistory.length} scans</span>
            </div>

            <div className="space-y-2.5">
              {scanHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-[#E8ECE9] bg-[#FAFCFA] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-medium text-[#171C19]">
                      {item.ticketNumber || 'UNKNOWN-TICKET'}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        item.result === 'success'
                          ? 'text-black font-semibold'
                          : item.result === 'already_used'
                          ? 'text-amber-600'
                          : 'text-red-600'
                      }`}
                    >
                      {item.result === 'success'
                        ? 'Admitted'
                        : item.result === 'already_used'
                        ? 'Duplicate'
                        : 'Rejected'}
                    </span>
                  </div>
                  {item.attendeeName && (
                    <p className="text-[#171C19] font-medium">{item.attendeeName}</p>
                  )}
                  <p className="text-[10px] text-[#818A84]">{item.scannedAt}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
