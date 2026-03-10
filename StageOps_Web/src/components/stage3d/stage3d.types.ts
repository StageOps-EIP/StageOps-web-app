import type { Equipment } from '@/lib/types';

export type CameraView = '3d' | 'front' | 'top';

export interface Stage3DCanvasProps {
  equipment: Equipment[];
  selectedEquipment: Equipment | null;
  onSelectEquipment: (eq: Equipment | null) => void;
  viewMode: CameraView;
  onExport?: () => void;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

export interface EquipmentMarkerProps {
  equipment: Equipment;
  isSelected: boolean;
  onSelect: (eq: Equipment) => void;
}
