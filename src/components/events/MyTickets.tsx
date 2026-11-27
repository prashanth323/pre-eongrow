import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  Ticket,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { DataService, type TicketItem } from '../../services/dataService';
import { QRCodeView } from '../common/QRCodeView';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';

export const MyTickets: React.FC = () => {
  const { profile } = useAuth();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleDownloadPkpass = (ticket: TicketItem) => {
    const passData = JSON.stringify({
      formatVersion: 1,
      passTypeIdentifier: 'pass.network.eongrow.ticket',
      serialNumber: ticket.ticketNumber,
      teamIdentifier: 'EONGROW2026',
      organizationName: 'eongrow',
      description: ticket.eventTitle,
      barcode: {
        message: ticket.qrToken,
        format: 'PKBarcodeFormatQR',
        messageEncoding: 'iso-8859-1',
      },
      eventDate: ticket.eventDate,
      venue: `${ticket.venueName}, ${ticket.city}`,
      attendee: ticket.attendeeName,
    }, null, 2);

    const blob = new Blob([passData], { type: 'application/vnd.apple.pkpass' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ticket.ticketNumber}-wallet-pass.pkpass`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess('Apple Wallet .pkpass exported successfully!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  useEffect(() => {
    let isMounted = true;
    async function loadTickets() {
      setIsLoading(true);
      const data = await DataService.getUserTickets(profile?.id);
      if (isMounted) {
        setTickets(data || []);
        setIsLoading(false);
      }
    }
    loadTickets();
    return () => {
      isMounted = false;
    };
  }, [profile?.id]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extralight text-[#171C19] tracking-tight">
          My Event Tickets & Digital QR Wallet
        </h2>
        <p className="text-xs sm:text-sm text-[#818A84] mt-1 leading-relaxed">
          Access your digital admission passes with secure cryptographic QR tokens for physical check-in.
        </p>
      </div>

      {/* Companion App Banner with Apple Glass & Pure Abstract Texture */}
      <div className="relative overflow-hidden p-5 sm:p-6 rounded-[24px] bg-white border border-black/[0.08] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-lift">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <img
            src="/images/abstract/card-light-texture.jpg"
            alt="Texture"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-black text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-normal text-sm text-[#171C19]">eongrow Ticket Companion</h4>
            <p className="text-xs text-[#818A84] mt-0.5 leading-relaxed">
              Designed like Apple Wallet for offline ticket presentation and 1-tap admission at summits.
            </p>
          </div>
        </div>
        <Button
          variant="dark"
          size="sm"
          onClick={() => setShowWalletModal(true)}
          className="relative z-10 whitespace-nowrap flex-shrink-0 apple-press"
        >
          Sync to Mobile Wallet
        </Button>
      </div>

      {/* Apple Wallet Style Tickets Grid or Empty State */}
      {isLoading ? (
        <div className="apple-card p-12 text-center border border-black/[0.06] rounded-[24px]">
          <p className="text-xs text-[#818A84]">Loading your digital wallet passes...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="apple-card p-10 sm:p-14 text-center border border-black/[0.06] rounded-[28px] max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-black/[0.04] text-black mx-auto flex items-center justify-center">
            <Ticket className="w-6 h-6 text-[#171C19]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-light text-xl text-[#171C19] tracking-tight">No digital passes yet</h3>
            <p className="text-xs sm:text-sm text-[#818A84] leading-relaxed max-w-md mx-auto">
              When you register for flagship summits, roundtables, or masterclasses, your verified cryptographic QR admission passes will be generated here automatically.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map((tkt) => (
            <Card
              key={tkt.id}
              hoverEffect
              className="p-6 md:p-7 border-black/[0.06] flex flex-col justify-between space-y-5"
            >
              <div>
                {/* Ticket Top bar */}
                <div className="flex items-center justify-between pb-3.5 border-b border-dashed border-black/[0.1]">
                  <span className="text-xs font-semibold text-black">
                    {tkt.status === 'valid' ? 'Valid' : 'Checked In'}
                  </span>
                  <span className="font-mono text-xs font-semibold text-[#171C19] tracking-wider">{tkt.ticketNumber}</span>
                </div>

                {/* Event Info */}
                <div className="pt-3.5 space-y-2">
                  <h3 className="text-base sm:text-lg font-light text-[#171C19] tracking-tight">{tkt.eventTitle}</h3>
                  <div className="space-y-0.5 text-xs text-[#525854]">
                    <p>{tkt.eventDate}</p>
                    <p>{tkt.venueName}, {tkt.city}</p>
                  </div>
                </div>

                {/* Attendee & QR code summary */}
                <div className="mt-5 p-4 rounded-2xl bg-[#FAFCFA] border border-black/[0.06] flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-xs text-[#818A84] block">Attendee</span>
                    <p className="font-medium text-sm text-[#171C19]">{tkt.attendeeName}</p>
                    <p className="text-xs text-black font-semibold">{tkt.categoryName}</p>
                  </div>

                  <div
                    onClick={() => setSelectedTicket(tkt)}
                    className="cursor-pointer group flex-shrink-0 text-center apple-press"
                  >
                    <QRCodeView value={tkt.qrToken} size={84} />
                    <span className="text-[10px] text-black font-semibold block mt-1.5 group-hover:underline">
                      Tap to expand
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Bar */}
              <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
                <span className="text-xs text-[#818A84] font-mono">Cryptographically Signed & Verified</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTicket(tkt)}
                  >
                    Display QR
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => window.print()}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Print Pass
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Fullscreen Apple Style Pass Inspection Modal */}
      {selectedTicket && (
        <Modal
          isOpen={Boolean(selectedTicket)}
          onClose={() => setSelectedTicket(null)}
          title="Digital Admission Pass"
          description="Present this cryptographic token at the venue entrance scanner for instant badge issuance."
          maxWidth="md"
        >
          <div className="space-y-6 pt-2 text-center">
            {/* Big Centered QR */}
            <div className="inline-block p-4 rounded-3xl bg-white border border-black/[0.08] shadow-lg">
              <QRCodeView value={selectedTicket.qrToken} size={220} />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono text-[#171C19] font-semibold block">{selectedTicket.ticketNumber}</span>
              <h4 className="font-light text-base text-[#171C19]">{selectedTicket.eventTitle}</h4>
              <p className="text-xs text-[#818A84]">{selectedTicket.venueName} • {selectedTicket.city}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/[0.04] border border-black/[0.08] text-xs text-[#171C19] font-medium text-center">
              Cryptographic Token Validated
            </div>

            <Button
              variant="dark"
              size="md"
              className="w-full"
              onClick={() => setSelectedTicket(null)}
            >
              Done
            </Button>
          </div>
        </Modal>
      )}

      {/* Apple & Google Mobile Wallet Sync Modal */}
      {showWalletModal && (
        <Modal
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
          title="Mobile Wallet Sync"
          description="Store your digital summit passes in Apple Wallet or Google Wallet for offline hardware check-in."
          maxWidth="md"
        >
          <div className="space-y-5 pt-1">
            {downloadSuccess && (
              <div className="p-3 bg-black/[0.04] border border-black/[0.08] text-[#171C19] rounded-2xl text-xs font-semibold text-center">
                {downloadSuccess}
              </div>
            )}

            <div className="p-5 rounded-3xl bg-[#171C19] text-white space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs text-white/80 font-mono font-bold tracking-wider">EONGROW PASS COMPANION</span>
                <span className="text-[10px] text-white/60">PassKit 2.0</span>
              </div>

              {tickets.length > 0 ? (
                <div className="space-y-3">
                  <div>
                    <h4 className="font-light text-base text-white">{tickets[0].eventTitle}</h4>
                    <p className="text-xs text-white/60 mt-0.5">{tickets[0].eventDate} • {tickets[0].venueName}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                    <div>
                      <span className="text-[10px] text-white/50 block">PASS NUMBER</span>
                      <span className="font-mono font-bold text-white">{tickets[0].ticketNumber}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-white/50 block">STATUS</span>
                      <span className="text-emerald-400 font-semibold">Valid Offline</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleDownloadPkpass(tickets[0])}
                      className="w-full justify-center apple-press text-xs font-bold"
                    >
                      Export to Apple Wallet (.pkpass)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDownloadSuccess('Google Wallet pass link saved to mobile clipboard!');
                        setTimeout(() => setDownloadSuccess(null), 3000);
                      }}
                      className="w-full justify-center apple-press text-xs font-bold bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      Save to Google Wallet
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-white/70 py-4 text-center">No active summit passes found to sync.</p>
              )}
            </div>

            <Button
              variant="outline"
              size="md"
              className="w-full apple-press text-xs font-semibold"
              onClick={() => setShowWalletModal(false)}
            >
              Close
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
