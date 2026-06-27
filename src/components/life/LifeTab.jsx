import { useState } from 'react'
import TodosTab from '../todos/TodosTab'
import NotesTab from '../notes/NotesTab'
import PeopleTab from '../people/PeopleTab'
import TrashTab from '../trash/TrashTab'

const SUB_TABS = [
  { id: 'todos', label: 'Todos' },
  { id: 'notes', label: 'Notes' },
  { id: 'people', label: 'People' },
  { id: 'trash', label: 'Trash' },
]

export default function LifeTab() {
  const [activeSubTab, setActiveSubTab] = useState('todos')

  const subTabContent = {
    todos: <TodosTab />,
    notes: <NotesTab />,
    people: <PeopleTab />,
    trash: <TrashTab />,
  }

  return (
    <div>
      <div className="flex gap-2 px-4 pt-4 overflow-x-auto">
        {SUB_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeSubTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {subTabContent[activeSubTab]}
    </div>
  )
}
