import { prisma } from '@/lib/prisma';
import styles from './page.module.css';
import RoomEditorRow from './RoomEditorRow';
import CreateRoomBtn from './CreateRoomBtn';

export const dynamic = 'force-dynamic';

export default async function RoomsPage() {
  const rooms = await prisma.room.findMany({
    orderBy: { sortOrder: 'asc' }
  });

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Habitaciones</h1>
          <p className={styles.subtitle}>Configura el nombre, precio por noche y capacidad de tus unidades.</p>
        </div>
        <CreateRoomBtn />
      </div>

      <div className={styles.roomList}>
        {rooms.map((room) => (
          <RoomEditorRow key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
}
