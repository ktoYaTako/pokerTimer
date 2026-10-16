import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { useTournament } from '../hooks/useTournament';
import * as api from '../api/tournament';
import { LevelEditorModal } from '../components/LevelEditorModal';
import { LevelListItem } from '../components/LevelListItem';
import '../styles/EditTournamentPage.css';

export function EditTournamentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tournament, loading, error } = useTournament(id!);
  const [name, setName] = useState('');
  const [levels, setLevels] = useState<any[]>([]);
  const [editingLevel, setEditingLevel] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tournament) {
      setName(tournament.name);
      setLevels(tournament.levels || []);
    }
  }, [tournament]);

  const handleAddLevel = () => {
    setEditingLevel({});
  };

  const handleEditLevel = (level: any) => {
    setEditingLevel(level);
  };

  const handleDeleteLevel = async (index: number) => {
    if (levels.length === 1) {
      alert('Tournament must have at least one level');
      return;
    }
    if (confirm('Delete this level?')) {
      try {
        setSaving(true);
        await api.removeLevel(id!, index);
        const newLevels = levels.filter((_, i) => i !== index);
        setLevels(newLevels);
      } catch (err) {
        alert((err as Error).message);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSaveLevel = async (level: any) => {
    try {
      setSaving(true);
      const existingIndex = levels.findIndex((l) => l.id === level.id);

      if (existingIndex >= 0) {
        await api.updateLevel(id!, existingIndex, level);
        const newLevels = [...levels];
        newLevels[existingIndex] = level;
        setLevels(newLevels);
      } else {
        await api.addLevel(id!, level);
        setLevels([...levels, level]);
      }

      setEditingLevel(null);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    if (!destination || (source.index === destination.index)) {
      return;
    }

    const newLevels = Array.from(levels);
    const [removed] = newLevels.splice(source.index, 1);
    newLevels.splice(destination.index, 0, removed);

    setLevels(newLevels);

    try {
      setSaving(true);
      await api.reorderLevels(id!, newLevels);
    } catch (err) {
      alert((err as Error).message);
      setLevels(levels);
    } finally {
      setSaving(false);
    }
  };

  const handleNameChange = async (newName: string) => {
    setName(newName);
    try {
      setSaving(true);
      await api.updateTournamentConfig(id!, { name: newName });
    } catch (err) {
      alert((err as Error).message);
      setName(tournament?.name || '');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!tournament) return <div>Tournament not found</div>;
  if (tournament.state.status !== 'idle') {
    return (
      <div className="edit-page">
        <div className="warning">
          Can only edit tournament structure when it's idle. Current status: {tournament.state.status}
        </div>
        <button onClick={() => navigate(`/admin/${id}`)}>Back to Admin</button>
      </div>
    );
  }

  return (
    <div className="edit-page">
      <div className="edit-header">
        <h1>Edit Tournament Structure</h1>
        <button className="btn-back" onClick={() => navigate(`/admin/${id}`)}>
          Back to Admin
        </button>
      </div>

      <div className="form-group">
        <label>Tournament Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          disabled={saving}
        />
      </div>

      <div className="levels-section">
        <div className="section-header">
          <h2>Levels</h2>
          <button className="btn-add" onClick={handleAddLevel} disabled={saving}>
            + Add Level
          </button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="levels-list">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`levels-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
              >
                {levels.map((level, index) => (
                  <LevelListItem
                    key={level.id}
                    level={level}
                    index={index}
                    onEdit={handleEditLevel}
                    onDelete={handleDeleteLevel}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {editingLevel !== null && (
        <LevelEditorModal
          level={editingLevel && Object.keys(editingLevel).length > 0 ? editingLevel : undefined}
          onSave={handleSaveLevel}
          onClose={() => setEditingLevel(null)}
        />
      )}
    </div>
  );
}
