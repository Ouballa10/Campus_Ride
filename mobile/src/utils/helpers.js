export function getInitials(name = '') {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

export function formatRelativeDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.round((date - now) / 86400000);

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Demain';
  if (diffDays === -1) return 'Hier';
  if (diffDays > 1 && diffDays < 7) {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[date.getDay()];
  }

  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export function formatClock(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function formatDuration(minutes) {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins ? `${hours}h${mins}` : `${hours}h`;
  }
  return `${minutes} min`;
}

export function formatTimeWindow(departureAt, durationMinutes) {
  const start = new Date(departureAt);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  return `${formatClock(departureAt)} - ${formatClock(end.toISOString())}`;
}

export function getStatusColor(status) {
  switch (status) {
    case 'Confirmee':
    case 'Actif':
      return '#2ECC71';
    case 'En attente':
    case 'Nouveau':
      return '#F39C12';
    case 'Annulee':
    case 'Refusee':
    case 'Ferme':
      return '#E74C3C';
    case 'Complet':
      return '#6C63FF';
    case 'Terminee':
    case 'Passe':
      return '#718096';
    default:
      return '#A0AEC0';
  }
}
