'use client';

import { useState } from 'react';
import styles from './page.module.css';
import { updateReservationStatus, updateAmenityReservationStatus, createAmenityReservation } from '../../actions';

interface UnifiedReservation {
  id: string;
  type: 'room' | 'amenity';
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  itemName: string;
  dateStart: string;
  dateEnd: string;
  timeSlot: string;
  guests: number;
  totalPrice: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  notes: string;
}

interface AmenityOption {
  id: string;
  title_es: string;
  price: number;
}

export default function ReservationFilters({ data, amenities }: { data: UnifiedReservation[], amenities: AmenityOption[] }) {
  const [typeFilter, setTypeFilter] = useState<'all' | 'room' | 'amenity'>('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showForm, setShowForm] = useState(false);

  // New amenity reservation form state
  const [formAmenityId, setFormAmenityId] = useState('');
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('09:00 - 12:00');
  const [formGuests, setFormGuests] = useState('1');
  const [formNotes, setFormNotes] = useState('');
  const [creating, setCreating] = useState(false);

  const filtered = data
    .filter(r => typeFilter === 'all' || r.type === typeFilter)
    .filter(r => statusFilter === 'all' || r.status === statusFilter)
    .filter(r => {
      if (!dateFrom && !dateTo) return true;
      const d = new Date(r.dateStart);
      if (dateFrom && d < new Date(dateFrom)) return false;
      if (dateTo && d > new Date(dateTo + 'T23:59:59')) return false;
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleStatusChange = async (id: string, type: string, newStatus: string) => {
    if (type === 'room') await updateReservationStatus(id, newStatus);
    else await updateAmenityReservationStatus(id, newStatus);
  };

  const handleCreateReservation = async () => {
    if (!formAmenityId || !formName || !formDate) return;
    setCreating(true);
    const amenity = amenities.find(a => a.id === formAmenityId);
    await createAmenityReservation({
      amenityId: formAmenityId,
      guestName: formName,
      guestPhone: formPhone,
      guestEmail: formEmail,
      date: formDate,
      timeSlot: formTime,
      guests: Number(formGuests) || 1,
      totalPrice: amenity?.price || 0,
      notes: formNotes,
    });
    setFormAmenityId(''); setFormName(''); setFormPhone(''); setFormEmail('');
    setFormDate(''); setFormGuests('1'); setFormNotes('');
    setShowForm(false);
    setCreating(false);
  };

  return (
    <>
      {/* FILTERS */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Tipo</label>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)}>
            <option value="all">Todas</option>
            <option value="room">🛏️ Habitaciones</option>
            <option value="amenity">🏊 Amenidades</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label>Estado</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">Todos</option>
            <option value="PENDING">Pendiente</option>
            <option value="CONFIRMED">Confirmada</option>
            <option value="COMPLETED">Completada</option>
            <option value="CANCELLED">Cancelada</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label>Desde</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div className={styles.filterGroup}>
          <label>Hasta</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        <div className={styles.filterGroup} style={{ alignSelf: 'flex-end' }}>
          <button onClick={() => { setTypeFilter('all'); setStatusFilter('all'); setDateFrom(''); setDateTo(''); }} className={styles.clearBtn}>
            Limpiar
          </button>
        </div>
        <div className={styles.filterGroup} style={{ alignSelf: 'flex-end' }}>
          <button onClick={() => setShowForm(!showForm)} className={styles.addResBtn}>
            + Reservar Amenidad
          </button>
        </div>
      </div>

      {/* CREATE AMENITY RESERVATION FORM */}
      {showForm && (
        <div className={styles.createForm}>
          <h3>Nueva Reserva de Amenidad</h3>
          <div className={styles.formGrid}>
            <div className={styles.filterGroup}>
              <label>Amenidad *</label>
              <select value={formAmenityId} onChange={e => setFormAmenityId(e.target.value)}>
                <option value="">Seleccionar...</option>
                {amenities.map(a => <option key={a.id} value={a.id}>{a.title_es} (L {a.price})</option>)}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>Nombre del huésped *</label>
              <input type="text" value={formName} onChange={e => setFormName(e.target.value)} />
            </div>
            <div className={styles.filterGroup}>
              <label>Teléfono</label>
              <input type="text" value={formPhone} onChange={e => setFormPhone(e.target.value)} />
            </div>
            <div className={styles.filterGroup}>
              <label>Email</label>
              <input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} />
            </div>
            <div className={styles.filterGroup}>
              <label>Fecha *</label>
              <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} />
            </div>
            <div className={styles.filterGroup}>
              <label>Horario</label>
              <select value={formTime} onChange={e => setFormTime(e.target.value)}>
                <option value="09:00 - 12:00">09:00 - 12:00</option>
                <option value="12:00 - 15:00">12:00 - 15:00</option>
                <option value="15:00 - 18:00">15:00 - 18:00</option>
                <option value="Día completo">Día completo</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label># Personas</label>
              <input type="number" value={formGuests} onChange={e => setFormGuests(e.target.value)} min="1" />
            </div>
            <div className={styles.filterGroup}>
              <label>Notas</label>
              <input type="text" value={formNotes} onChange={e => setFormNotes(e.target.value)} placeholder="Opcional" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button onClick={handleCreateReservation} disabled={creating} className={styles.addResBtn}>
              {creating ? 'Creando...' : 'Crear Reserva'}
            </button>
            <button onClick={() => setShowForm(false)} className={styles.clearBtn}>Cancelar</button>
          </div>
        </div>
      )}

      {/* RESULTS COUNT */}
      <div className={styles.resultCount}>
        {filtered.length} reservación{filtered.length !== 1 ? 'es' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
      </div>

      {/* TABLE */}
      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Huésped</th>
                <th>Habitación / Amenidad</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className={styles.empty}>No se encontraron reservaciones con estos filtros.</td></tr>
              ) : filtered.map((r) => (
                <tr key={`${r.type}-${r.id}`}>
                  <td>
                    <span className={`${styles.typeBadge} ${r.type === 'room' ? styles.typeRoom : styles.typeAmenity}`}>
                      {r.type === 'room' ? '🛏️' : '🏊'}
                    </span>
                  </td>
                  <td>
                    <strong>{r.guestName}</strong><br/>
                    {r.guestEmail && <span className={styles.mutedText}>{r.guestEmail}</span>}
                    {r.guestPhone && <><br/><span className={styles.mutedText}>{r.guestPhone}</span></>}
                  </td>
                  <td>{r.itemName}</td>
                  <td>
                    {new Date(r.dateStart).toLocaleDateString('es-HN')}
                    {r.dateEnd && <><br/><span className={styles.mutedText}>a {new Date(r.dateEnd).toLocaleDateString('es-HN')}</span></>}
                    {r.timeSlot && <><br/><span className={styles.mutedText}>{r.timeSlot}</span></>}
                  </td>
                  <td>L {r.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[r.status.toLowerCase()]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    {r.status === 'PENDING' && (
                      <button onClick={() => handleStatusChange(r.id, r.type, 'CONFIRMED')} className={styles.actionBtn}>Confirmar</button>
                    )}
                    {r.status === 'CONFIRMED' && (
                      <button onClick={() => handleStatusChange(r.id, r.type, 'COMPLETED')} className={styles.actionBtn}>Completar</button>
                    )}
                    {(r.status === 'PENDING' || r.status === 'CONFIRMED') && (
                      <button onClick={() => handleStatusChange(r.id, r.type, 'CANCELLED')} className={styles.cancelResBtn}>Cancelar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
