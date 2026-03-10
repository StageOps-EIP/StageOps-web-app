import { useState } from 'react';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { Card } from '../../components/design-system/Card';
import { Button } from '../../components/design-system/Button';
import { Badge } from '../../components/design-system/Badge';
import { mockEquipment } from '../../lib/mockData';
import { QrCode, Camera, AlertCircle, MapPin, User, Clock } from 'lucide-react';
import { formatDateTime } from '../../lib/utils';

export function MobileScan() {
  const [scannedEquipment, setScannedEquipment] = useState(mockEquipment[1]); // Mock scan result
  const [isScanning, setIsScanning] = useState(false);
  
  const handleScan = () => {
    setIsScanning(true);
    // Simulate scan delay
    setTimeout(() => {
      setScannedEquipment(mockEquipment[1]);
      setIsScanning(false);
    }, 1500);
  };
  
  return (
    <div className="min-h-screen pb-24 bg-[#0a0a0b]">
      <MobileHeader title="Scanner QR" />
      
      <div className="p-4 space-y-4">
        {/* Scanner Area */}
        <Card className="relative overflow-hidden">
          {!isScanning ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto bg-cyan-400/10 rounded-3xl flex items-center justify-center mb-4">
                <QrCode size={48} className="text-cyan-400" />
              </div>
              <h2 className="text-lg font-semibold text-[#f5f5f7] mb-2">
                Scanner un équipement
              </h2>
              <p className="text-sm text-[#71717a] mb-6">
                Positionnez le QR code dans le cadre
              </p>
              <Button variant="primary" size="lg" onClick={handleScan}>
                <Camera size={20} />
                Activer caméra
              </Button>
            </div>
          ) : (
            <div className="relative aspect-square bg-[#0a0a0b] rounded-xl overflow-hidden">
              {/* Camera simulation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-4 border-cyan-400 rounded-2xl animate-pulse" />
              </div>
              <p className="absolute bottom-6 left-0 right-0 text-center text-sm text-cyan-400 font-medium">
                Recherche en cours...
              </p>
            </div>
          )}
        </Card>
        
        {/* Scanned Result */}
        {scannedEquipment && !isScanning && (
          <>
            <div className="flex items-center gap-2 text-green-500">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm font-medium">Équipement scanné avec succès</span>
            </div>
            
            <Card>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#f5f5f7] mb-2">
                    {scannedEquipment.name}
                  </h3>
                  <code className="text-xs text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded">
                    {scannedEquipment.qrCode}
                  </code>
                </div>
                <Badge status={scannedEquipment.status} />
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-[#71717a] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[#71717a]">Emplacement</p>
                    <p className="text-sm text-[#f5f5f7]">{scannedEquipment.location}</p>
                    {scannedEquipment.zone && (
                      <p className="text-xs text-[#a1a1aa] mt-0.5">Zone: {scannedEquipment.zone}</p>
                    )}
                  </div>
                </div>
                
                {scannedEquipment.responsiblePerson && (
                  <div className="flex items-start gap-3">
                    <User size={16} className="text-[#71717a] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-[#71717a]">Responsable</p>
                      <p className="text-sm text-[#f5f5f7]">{scannedEquipment.responsiblePerson}</p>
                    </div>
                  </div>
                )}
                
                {scannedEquipment.lastCheck && (
                  <div className="flex items-start gap-3">
                    <Clock size={16} className="text-[#71717a] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-[#71717a]">Dernière vérification</p>
                      <p className="text-sm text-[#f5f5f7]">
                        {formatDateTime(scannedEquipment.lastCheck)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {scannedEquipment.notes && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-6">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-amber-500 font-medium mb-1">Notes</p>
                      <p className="text-sm text-[#f5f5f7]">{scannedEquipment.notes}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Quick Status Actions */}
              <div className="space-y-2">
                <p className="text-xs text-[#71717a] font-medium uppercase tracking-wide mb-3">
                  Changer le statut
                </p>
                <button className="w-full py-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 font-medium hover:bg-green-500/20 transition-colors active:scale-95">
                  ✓ Marquer OK
                </button>
                <button className="w-full py-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 font-medium hover:bg-amber-500/20 transition-colors active:scale-95">
                  ⚠ À vérifier
                </button>
                <button className="w-full py-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 font-medium hover:bg-red-500/20 transition-colors active:scale-95">
                  ✕ Passer en HS
                </button>
              </div>
            </Card>
            
            {/* Actions */}
            <div className="space-y-3">
              <Button variant="primary" fullWidth size="lg">
                <AlertCircle size={20} />
                Signaler un incident
              </Button>
              <Button variant="secondary" fullWidth size="lg" onClick={handleScan}>
                <QrCode size={20} />
                Scanner un autre équipement
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
