import { Draggable } from 'react-beautiful-dnd';
import '../styles/LevelListItem.css';

interface LevelListItemProps {
  level: any;
  index: number;
  onEdit: (level: any) => void;
  onDelete: (index: number) => void;
}

export function LevelListItem({ level, index, onEdit, onDelete }: LevelListItemProps) {
  const formatLevel = (level: any) => {
    if (level.type === 'break') {
      return `Break - ${Math.floor(level.durationSeconds / 60)}m`;
    }
    return `${level.smallBlind}/${level.bigBlind} (ante ${level.ante}) - ${Math.floor(level.durationSeconds / 60)}m`;
  };

  return (
    <Draggable draggableId={`level-${index}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`level-item ${snapshot.isDragging ? 'dragging' : ''}`}
        >
          <div {...provided.dragHandleProps} className="drag-handle">
            ⋮⋮
          </div>
          <div className="level-info">
            <span className="level-number">Level {index + 1}</span>
            <span className="level-details">{formatLevel(level)}</span>
          </div>
          <div className="level-actions">
            <button className="btn-edit" onClick={() => onEdit(level)}>
              Edit
            </button>
            <button className="btn-delete" onClick={() => onDelete(index)}>
              Delete
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
}
