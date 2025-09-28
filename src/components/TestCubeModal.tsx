import React from 'react';
import { Button } from '@/components/ui/button';

interface TestCubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  testCube: {
    position: [number, number, number];
    status: 'at-moon' | 'traveling' | 'at-earth';
    travelProgress: number;
  };
  onLaunch: () => void;
  onReset: () => void;
}

export function TestCubeModal({ isOpen, onClose, testCube, onLaunch, onReset }: TestCubeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-600 shadow-xl max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold text-slate-200 mb-4">Test Cube Control</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <p className="text-slate-300 text-sm mb-2">
              Status: <span className="text-red-400 font-semibold">
                {testCube.status === 'at-moon' ? 'At Moon' : 
                 testCube.status === 'traveling' ? `Traveling (${(testCube.travelProgress * 100).toFixed(1)}%)` : 
                 'At Earth'}
              </span>
            </p>
            <p className="text-slate-400 text-xs">
              Position: ({testCube.position[0].toFixed(1)}, {testCube.position[1].toFixed(1)}, {testCube.position[2].toFixed(1)})
            </p>
          </div>
          
          <div className="flex gap-3">
            {testCube.status === 'at-moon' && (
              <Button
                onClick={onLaunch}
                className="bg-red-600 hover:bg-red-700 text-white flex-1"
              >
                Launch to Earth
              </Button>
            )}
            
            {testCube.status === 'at-earth' && (
              <Button
                onClick={onReset}
                className="bg-slate-600 hover:bg-slate-700 text-white flex-1"
              >
                Reset to Moon
              </Button>
            )}
            
            <Button
              onClick={onClose}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}