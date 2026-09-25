import React, { createContext, useContext, useState, useEffect } from 'react';

interface TelemetryPing {
  shipmentId: string;
  lat: number;
  lng: number;
  speed: number;
  temperature: number;
  location: string;
  status: string;
  timestamp: string;
}

interface SimulationContextType {
  isLivePulseActive: boolean;
  toggleLivePulse: () => void;
  telemetry: TelemetryPing;
  pingCount: number;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLivePulseActive, setIsLivePulseActive] = useState<boolean>(true);
  const [pingCount, setPingCount] = useState<number>(142);

  // Simulated GPS route points between Chennai and Bangalore via NH-44
  const routeWaypoints = [
    { lat: 12.9815, lng: 80.0152, loc: 'Chennai Sriperumbudur Hub', speed: 52, temp: 22.4 },
    { lat: 12.8342, lng: 79.7036, loc: 'Kanchipuram Highway Intersection', speed: 68, temp: 22.8 },
    { lat: 12.9165, lng: 79.1325, loc: 'Vellore Bypass Checkpoint', speed: 74, temp: 23.1 },
    { lat: 12.7561, lng: 78.5833, loc: 'Ambur Leather Corridor', speed: 65, temp: 23.0 },
    { lat: 12.5266, lng: 78.2146, loc: 'Krishnagiri Toll Plaza NH-44', speed: 38, temp: 22.6 },
    { lat: 12.7409, lng: 77.8253, loc: 'Hosur Border Ghat Section', speed: 44, temp: 21.9 },
    { lat: 12.8452, lng: 77.6602, loc: 'Electronic City Tollway', speed: 58, temp: 21.5 },
    { lat: 13.2084, lng: 77.7126, loc: 'Bangalore Tech Distribution Gateway', speed: 20, temp: 21.0 },
  ];

  const [stepIndex, setStepIndex] = useState<number>(4);

  const [telemetry, setTelemetry] = useState<TelemetryPing>({
    shipmentId: 'SH-10234',
    lat: routeWaypoints[4].lat,
    lng: routeWaypoints[4].lng,
    speed: routeWaypoints[4].speed,
    temperature: routeWaypoints[4].temp,
    location: routeWaypoints[4].loc,
    status: 'IN_TRANSIT',
    timestamp: new Date().toLocaleTimeString(),
  });

  useEffect(() => {
    if (!isLivePulseActive) return;

    const interval = setInterval(() => {
      setStepIndex(prev => {
        const next = (prev + 1) % routeWaypoints.length;
        const currentPoint = routeWaypoints[next];

        setTelemetry({
          shipmentId: 'SH-10234',
          lat: Number((currentPoint.lat + (Math.random() - 0.5) * 0.005).toFixed(4)),
          lng: Number((currentPoint.lng + (Math.random() - 0.5) * 0.005).toFixed(4)),
          speed: Math.round(currentPoint.speed + (Math.random() * 6 - 3)),
          temperature: Number((currentPoint.temp + (Math.random() * 0.4 - 0.2)).toFixed(1)),
          location: currentPoint.loc,
          status: next === routeWaypoints.length - 1 ? 'ARRIVED' : 'IN_TRANSIT',
          timestamp: new Date().toLocaleTimeString(),
        });

        setPingCount(c => c + 1);
        return next;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isLivePulseActive]);

  const toggleLivePulse = () => {
    setIsLivePulseActive(!isLivePulseActive);
  };

  return (
    <SimulationContext.Provider value={{ isLivePulseActive, toggleLivePulse, telemetry, pingCount }}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
