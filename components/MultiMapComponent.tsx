"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../lib/constants';
import { formatDateTime } from './formatters';

// Fix for default marker icon in leaflet with Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

// Custom icons based on status and urgency
const createCustomIcon = (color: string, isUrgent: boolean = false) => {
  if (isUrgent) {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="relative flex h-6 w-6">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style="background-color: ${color};"></span>
          <span class="relative inline-flex rounded-full h-6 w-6 border-2 border-white shadow-lg" style="background-color: ${color}; box-shadow: 0 0 10px ${color};"></span>
          <div class="absolute inset-0 flex items-center justify-center text-white font-black text-[10px]">!</div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    });
  }

  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

const iconCache: Record<string, L.DivIcon> = {};

function getMarkerIcon(log: any) {
  const isUrgent = log.priority === 'urgent' || log.priority === 'high';
  let color = '#ef4444'; // default red
  if (log.status === 'completed') color = '#10b981';
  if (log.status === 'cancelled') color = '#6b7280';
  if (log.status === 'in_progress') color = '#3b82f6';
  if (log.status === 'pending_parts') color = '#f97316';
  
  const cacheKey = `${color}-${isUrgent}`;
  if (!iconCache[cacheKey]) {
    iconCache[cacheKey] = createCustomIcon(color, isUrgent);
  }
  
  return iconCache[cacheKey];
}

export default function MultiMapComponent({ logs, onMarkerClick }: { logs: any[], onMarkerClick?: (log: any) => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl flex items-center justify-center text-slate-400 text-sm font-bold shadow-inner">กำลังโหลดแผนที่...</div>;

  // Center map on Thailand or the first log's coordinates if available
  const defaultCenter: [number, number] = logs.length > 0 
    ? [logs[0].latitude, logs[0].longitude] 
    : [13.7563, 100.5018]; // Bangkok

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-sm relative z-0">
      <MapContainer center={defaultCenter} zoom={6} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterGroup 
          chunkedLoading 
          maxClusterRadius={50}
          iconCreateFunction={(cluster: any) => {
            const count = cluster.getChildCount();
            let size = 36;
            let bgColor = 'bg-emerald-500';
            
            if (count > 10) {
              size = 44;
              bgColor = 'bg-orange-500';
            }
            if (count > 50) {
              size = 52;
              bgColor = 'bg-rose-500';
            }
            
            return L.divIcon({
              html: `<div class="flex items-center justify-center w-full h-full ${bgColor} text-white font-black rounded-full border-[3px] border-white shadow-lg text-sm transition-transform hover:scale-110">${count}</div>`,
              className: '',
              iconSize: L.point(size, size, true),
            });
          }}
        >
          {logs.map((log) => {
            if (!log.latitude || !log.longitude) return null;
            
            return (
              <Marker 
                key={log.maintenanceLogId || log.id} 
                position={[log.latitude, log.longitude]} 
                icon={getMarkerIcon(log)}
              >
                <Popup>
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    <div className="border-b pb-2 mb-1">
                      <span className="font-black text-sm">#{log.maintenanceLogId || log.id} {log.vehiclePlate}</span>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{log.description}</p>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">สถานะ:</span>
                      <span className="font-bold">{STATUS_CONFIG[log.status]?.text || log.status}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">ความเร่งด่วน:</span>
                      <span className="font-bold">{PRIORITY_CONFIG[log.priority]?.text || log.priority}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">พิกัด:</span>
                      <span className="font-mono">{log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}</span>
                    </div>

                    {onMarkerClick && (
                      <button 
                        onClick={(e) => { e.preventDefault(); onMarkerClick(log); }}
                        className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded text-xs transition-colors"
                      >
                        ดูรายละเอียดใบงาน
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
