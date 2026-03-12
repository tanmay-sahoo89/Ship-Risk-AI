import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { db } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';

const CARRIERS = ['FedEx', 'DHL', 'UPS', 'Maersk', 'DB Schenker', 'XPO Logistics'];
const ORIGINS = ['Shanghai', 'Hamburg', 'Los Angeles', 'Mumbai', 'Rotterdam', 'Dubai'];
const DESTINATIONS = ['New York', 'London', 'Tokyo', 'Sydney', 'Chicago', 'Singapore'];
const TRANSPORT_MODES = ['Air', 'Sea', 'Road', 'Rail'];
const WEATHER_CONDITIONS = ['Clear', 'Rain', 'Heavy Rain', 'Storm', 'Fog', 'Snow', 'Blizzard'];
const DISRUPTION_TYPES = ['None', 'Port Strike', 'Traffic Jam', 'Natural Disaster', 'Equipment Failure'];

interface FormField {
  label: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'date';
  options?: string[];
  step?: string;
  min?: string;
  max?: string;
  required?: boolean;
}

const formFields: FormField[] = [
  { label: 'Shipment ID', name: 'shipment_id', type: 'text', required: true },
  { label: 'Origin', name: 'origin', type: 'select', options: ORIGINS, required: true },
  { label: 'Destination', name: 'destination', type: 'select', options: DESTINATIONS, required: true },
  { label: 'Carrier', name: 'carrier', type: 'select', options: CARRIERS, required: true },
  { label: 'Transport Mode', name: 'transport_mode', type: 'select', options: TRANSPORT_MODES, required: true },
  { label: 'Shipment Date', name: 'shipment_date', type: 'date', required: true },
  { label: 'Planned ETA', name: 'planned_eta', type: 'date', required: true },
  { label: 'Planned Transit Days', name: 'planned_transit_days', type: 'number', min: '1', max: '60' },
  { label: 'Days In Transit', name: 'days_in_transit', type: 'number', min: '0', max: '60' },
  { label: 'Package Weight (kg)', name: 'package_weight_kg', type: 'number', step: '0.1', min: '0' },
  { label: 'Number of Stops', name: 'num_stops', type: 'number', min: '1', max: '10' },
  { label: 'Weather Condition', name: 'weather_condition', type: 'select', options: WEATHER_CONDITIONS },
  { label: 'Weather Severity (0-10)', name: 'weather_severity_score', type: 'number', step: '0.1', min: '0', max: '10' },
  { label: 'Traffic Congestion (1-10)', name: 'traffic_congestion_level', type: 'number', min: '1', max: '10' },
  { label: 'Port Congestion (1-10)', name: 'port_congestion_score', type: 'number', min: '1', max: '10' },
  { label: 'Disruption Type', name: 'disruption_type', type: 'select', options: DISRUPTION_TYPES },
  { label: 'Disruption Impact (0-10)', name: 'disruption_impact_score', type: 'number', step: '0.1', min: '0', max: '10' },
  { label: 'Carrier Reliability (0-1)', name: 'carrier_reliability_score', type: 'number', step: '0.01', min: '0', max: '1' },
  { label: 'Historical Delay Rate (0-1)', name: 'historical_delay_rate', type: 'number', step: '0.01', min: '0', max: '1' },
  { label: 'Route Risk Score (0-1)', name: 'route_risk_score', type: 'number', step: '0.01', min: '0', max: '1' },
];

const defaultValues: Record<string, string> = {
  shipment_id: '',
  origin: 'Shanghai',
  destination: 'New York',
  carrier: 'FedEx',
  transport_mode: 'Sea',
  shipment_date: new Date().toISOString().split('T')[0],
  planned_eta: '',
  planned_transit_days: '14',
  days_in_transit: '0',
  package_weight_kg: '500',
  num_stops: '2',
  weather_condition: 'Clear',
  weather_severity_score: '0',
  traffic_congestion_level: '3',
  port_congestion_score: '3',
  disruption_type: 'None',
  disruption_impact_score: '0',
  carrier_reliability_score: '0.90',
  historical_delay_rate: '0.10',
  route_risk_score: '0.20',
};

export const AddShipment: React.FC = () => {
  const [form, setForm] = useState<Record<string, string>>(defaultValues);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.shipment_id.trim()) {
      addNotification('error', 'Shipment ID is required');
      return;
    }
    if (!db) {
      addNotification('error', 'Firebase is not configured');
      return;
    }

    setSubmitting(true);
    try {
      const record: Record<string, unknown> = { ...form };
      // Convert numeric fields
      for (const field of formFields) {
        if (field.type === 'number' && record[field.name] !== undefined) {
          record[field.name] = parseFloat(record[field.name] as string) || 0;
        }
      }
      record.customs_clearance_flag = 0;
      record.delay_probability = 0;
      record.is_delayed = 0;
      record.actual_delay_hours = 0;
      record.shipment_status = 'In Transit';

      await setDoc(doc(db, 'shipments', form.shipment_id), record);
      addNotification('success', `Shipment ${form.shipment_id} added successfully!`);
      navigate('/shipments');
    } catch (err) {
      addNotification('error', `Failed to add shipment: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Add New Shipment</h2>
        <p className="text-light">Enter shipment details to add a new tracking record</p>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formFields.map((field) => (
            <div key={field.name} className="space-y-1">
              <label className="block text-sm font-medium text-light">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </label>
              {field.type === 'select' ? (
                <select
                  name={field.name}
                  value={form[field.name] || ''}
                  onChange={handleChange}
                  className="input-field"
                >
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name] || ''}
                  onChange={handleChange}
                  step={field.step}
                  min={field.min}
                  max={field.max}
                  required={field.required}
                  className="input-field"
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center space-x-4">
          <button type="submit" disabled={submitting} className="btn-primary flex items-center space-x-2">
            {submitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span>{submitting ? 'Adding...' : 'Add Shipment'}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/shipments')}
            className="btn-secondary flex items-center space-x-2"
          >
            <span>Cancel</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
};
